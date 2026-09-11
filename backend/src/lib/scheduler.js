import cron from 'node-cron';
import { supabase } from '../config/supabase.js';
import { enviarMensagemWhatsApp } from './whatsapp.js';

const PRIMEIRO_FOLLOWUP_HORAS = 22;
const SEGUNDO_FOLLOWUP_DIAS = 7;

const MENSAGEM_22H =
  'Olá. Ainda tens interesse? Posso ajudar-te a avançar com o teu pedido.';

const MENSAGEM_7D =
  'Olá. Estou a fazer um último acompanhamento. Ainda precisas de ajuda?';

function horasDesde(data) {
  if (!data) return Infinity;

  return (
    (Date.now() - new Date(data).getTime()) /
    (1000 * 60 * 60)
  );
}

function diasDesde(data) {
  if (!data) return Infinity;

  return (
    (Date.now() - new Date(data).getTime()) /
    (1000 * 60 * 60 * 24)
  );
}

async function obterConfiguracaoRemarketing(userId) {
  try {
    const { data, error } = await supabase
      .from('automacoes')
      .select('configuracao, ativo')
      .eq('user_id', userId)
      .eq('tipo', 'remarketing')
      .eq('ativo', true)
      .maybeSingle();

    if (error) {
      console.warn(
        '[Scheduler] Não foi possível carregar configuração:',
        error.message
      );

      return null;
    }

    return data;
  } catch (error) {
    console.warn(
      '[Scheduler] Erro ao obter configuração:',
      error.message
    );

    return null;
  }
}

async function processarContacto(contacto) {
  const estado = String(contacto.estado || '').toLowerCase();

  if (!contacto.numero) return;
  if (estado === 'comprou') return;
  if (contacto.blacklist) return;

  const etapa = Number(contacto.remarketing_stage || 0);

  const configuracao = await obterConfiguracaoRemarketing(
    contacto.user_id
  );

  const config = configuracao?.configuracao || {};

  const mensagem22h =
    config.mensagem_22h ||
    config.mensagem_primeiro_followup ||
    MENSAGEM_22H;

  const mensagem7d =
    config.mensagem_7d ||
    config.mensagem_segundo_followup ||
    MENSAGEM_7D;

  let mensagem = null;
  let novaEtapa = etapa;

  /*
   * ETAPA 0
   * Primeiro follow-up 22 horas depois da última interação.
   */
  if (
    etapa === 0 &&
    contacto.ultima_interacao &&
    horasDesde(contacto.ultima_interacao) >= PRIMEIRO_FOLLOWUP_HORAS
  ) {
    mensagem = mensagem22h;
    novaEtapa = 1;
  }

  /*
   * ETAPA 1
   * Segundo follow-up 7 dias depois do primeiro remarketing.
   */
  if (
    etapa === 1 &&
    contacto.ultimo_remarketing_em &&
    diasDesde(contacto.ultimo_remarketing_em) >= SEGUNDO_FOLLOWUP_DIAS
  ) {
    mensagem = mensagem7d;
    novaEtapa = 2;
  }

  if (!mensagem) return;

  const resultado = await enviarMensagemWhatsApp(
    contacto.numero,
    mensagem
  );

  if (!resultado?.sucesso) {
    console.error(
      `[Scheduler] Falha ao enviar para ${contacto.numero}:`,
      resultado?.erro || 'erro desconhecido'
    );

    return;
  }

  const agora = new Date().toISOString();

  const { error: updateError } = await supabase
    .from('contactos')
    .update({
      estado: 'follow-up',
      remarketing_stage: novaEtapa,
      ultimo_remarketing_em: agora,
      tentativas_remarketing:
        Number(contacto.tentativas_remarketing || 0) + 1
    })
    .eq('id', contacto.id);

  if (updateError) {
    console.error(
      `[Scheduler] Mensagem enviada mas falhou atualização do contacto ${contacto.id}:`,
      updateError.message
    );

    return;
  }

  console.log(
    `[Scheduler] Follow-up ${novaEtapa} enviado para ${contacto.numero}`
  );
}

async function processarRemarketing() {
  try {
    const { data: contactos, error } = await supabase
      .from('contactos')
      .select(
        'id,user_id,numero,estado,ultima_interacao,ultimo_remarketing_em,tentativas_remarketing,remarketing_stage,blacklist'
      )
      .neq('estado', 'comprou')
      .eq('blacklist', false)
      .in('remarketing_stage', [0, 1]);

    if (error) {
      console.error(
        '[Scheduler] Erro ao carregar contactos:',
        error.message
      );

      return;
    }

    if (!contactos?.length) {
      console.log('[Scheduler] Nenhum contacto elegível para remarketing.');
      return;
    }

    console.log(
      `[Scheduler] A verificar ${contactos.length} contacto(s).`
    );

    for (const contacto of contactos) {
      try {
        await processarContacto(contacto);
      } catch (error) {
        console.error(
          `[Scheduler] Erro no contacto ${contacto.numero}:`,
          error.message
        );
      }
    }
  } catch (error) {
    console.error(
      '[Scheduler] Erro geral:',
      error.message
    );
  }
}

export function iniciarScheduler() {
  cron.schedule('*/15 * * * *', async () => {
    await processarRemarketing();
  });

  console.log(
    'Scheduler de remarketing iniciado. Primeiro follow-up: 22h. Segundo follow-up: 7 dias.'
  );
}

export { processarRemarketing };
