import cron from 'node-cron';
import { supabase } from '../config/supabase.js';
import { enviarMensagemWhatsApp } from './whatsapp.js';

const HORA_EM_MS = 60 * 60 * 1000;

export function iniciarScheduler() {
  // Corre a cada 15 minutos
  cron.schedule('*/15 * * * *', async () => {
    await processarRemarketing24h();
    await processarReinicioCiclo7dias();
  });

  console.log('⏱️  Scheduler de remarketing iniciado (verifica a cada 15 min).');
}

async function processarRemarketing24h() {
  const limite24h = new Date(Date.now() - 24 * HORA_EM_MS).toISOString();

  const { data: contactos } = await supabase
    .from('contactos')
    .select('*, produtos:produto_id(script_remarketing_24h, nome_produto)')
    .in('estado', ['conversando', 'novo'])
    .lte('ultima_interacao', limite24h)
    .eq('tentativas_remarketing', 0);

  for (const contacto of contactos || []) {
    const script = contacto.produtos?.script_remarketing_24h
      || `Olá! Ainda tens interesse no ${contacto.produtos?.nome_produto || 'produto'}? Posso ajudar-te a finalizar o pedido. 😊`;

    if (contacto.canal_origem === 'whatsapp') {
      await enviarMensagemWhatsApp({ numero: contacto.numero, texto: script });
    }

    await supabase.from('mensagens').insert({
      contacto_id: contacto.id,
      remetente: 'agente',
      conteudo: script,
      canal: contacto.canal_origem,
    });

    await supabase
      .from('contactos')
      .update({ estado: 'pendente', tentativas_remarketing: 1 })
      .eq('id', contacto.id);
  }
}

async function processarReinicioCiclo7dias() {
  const limite7dias = new Date(Date.now() - 7 * 24 * HORA_EM_MS).toISOString();

  const { data: contactos } = await supabase
    .from('contactos')
    .select('*')
    .eq('estado', 'pendente')
    .lte('ultima_interacao', limite7dias);

  for (const contacto of contactos || []) {
    await supabase
      .from('contactos')
      .update({
        estado: 'novo',
        tentativas_remarketing: 0,
        ciclo_reiniciado_em: new Date().toISOString(),
      })
      .eq('id', contacto.id);
  }
}
