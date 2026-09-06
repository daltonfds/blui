import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { responderMensagem } from '../lib/agente.js';
import { enviarMensagemWhatsApp } from '../lib/whatsapp.js';

const router = Router();

// ---------------------------------------------------------
// VERIFICAÇÃO DO WEBHOOK
// ---------------------------------------------------------
router.get('/whatsapp', (req, res) => verificarWebhook(req, res));
router.get('/messenger', (req, res) => verificarWebhook(req, res));
router.get('/instagram', (req, res) => verificarWebhook(req, res));

function verificarWebhook(req, res) {
  const modo = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const desafio = req.query['hub.challenge'];

  if (modo === 'subscribe' && token === process.env.META_VERIFY_TOKEN) {
    return res.status(200).send(desafio);
  }

  res.sendStatus(403);
}

// ---------------------------------------------------------
// WHATSAPP — RECEÇÃO DE MENSAGENS
// ---------------------------------------------------------
router.post('/whatsapp', async (req, res) => {
  // Responde imediatamente à Meta
  res.sendStatus(200);

  try {
    const entrada = req.body.entry?.[0]?.changes?.[0]?.value;
    const mensagem = entrada?.messages?.[0];

    if (!mensagem) return;

    const numero = mensagem.from;
    const texto = mensagem.text?.body || '';
    const phoneNumberId = entrada?.metadata?.phone_number_id;

    if (!phoneNumberId) {
      console.error('Webhook WhatsApp sem phone_number_id.');
      return;
    }

    // Descobre a conta BLUI através do WhatsApp Phone Number ID
    const { data: conta, error: erroConta } = await supabase
      .from('contas_anuncio')
      .select('id, user_id, whatsapp_phone_number_id')
      .eq('whatsapp_phone_number_id', phoneNumberId)
      .eq('plataforma', 'meta')
      .maybeSingle();

    if (erroConta) {
      console.error('Erro ao procurar conta WhatsApp:', erroConta.message);
      return;
    }

    if (!conta?.user_id) {
      console.error(
        `Nenhuma conta BLUI encontrada para WhatsApp Phone Number ID: ${phoneNumberId}`
      );
      return;
    }

    await processarMensagemRecebida({
      userId: conta.user_id,
      numero,
      texto,
      canal: 'whatsapp',
    });
  } catch (err) {
    console.error('Erro no webhook whatsapp:', err);
  }
});

// ---------------------------------------------------------
// MESSENGER
// ---------------------------------------------------------
router.post('/messenger', async (req, res) => {
  res.sendStatus(200);

  try {
    const evento = req.body.entry?.[0]?.messaging?.[0];

    if (!evento?.message) return;

    const pageId = req.body.entry?.[0]?.id;

    if (!pageId) {
      console.error('Webhook Messenger sem page_id.');
      return;
    }

    const { data: conta, error: erroConta } = await supabase
      .from('contas_anuncio')
      .select('id, user_id, page_id')
      .eq('page_id', pageId)
      .eq('plataforma', 'meta')
      .maybeSingle();

    if (erroConta) {
      console.error('Erro ao procurar conta Messenger:', erroConta.message);
      return;
    }

    if (!conta?.user_id) {
      console.error(
        `Nenhuma conta BLUI encontrada para página Messenger: ${pageId}`
      );
      return;
    }

    await processarMensagemRecebida({
      userId: conta.user_id,
      numero: evento.sender?.id,
      texto: evento.message.text || '',
      canal: 'messenger',
    });
  } catch (err) {
    console.error('Erro no webhook messenger:', err);
  }
});

// ---------------------------------------------------------
// INSTAGRAM
// ---------------------------------------------------------
router.post('/instagram', async (req, res) => {
  res.sendStatus(200);

  try {
    const evento = req.body.entry?.[0]?.messaging?.[0];

    if (!evento?.message) return;

    const instagramPageId = req.body.entry?.[0]?.id;

    if (!instagramPageId) {
      console.error('Webhook Instagram sem page_id.');
      return;
    }

    const { data: conta, error: erroConta } = await supabase
      .from('contas_anuncio')
      .select('id, user_id, page_id')
      .eq('page_id', instagramPageId)
      .eq('plataforma', 'meta')
      .maybeSingle();

    if (erroConta) {
      console.error('Erro ao procurar conta Instagram:', erroConta.message);
      return;
    }

    if (!conta?.user_id) {
      console.error(
        `Nenhuma conta BLUI encontrada para Instagram: ${instagramPageId}`
      );
      return;
    }

    await processarMensagemRecebida({
      userId: conta.user_id,
      numero: evento.sender?.id,
      texto: evento.message.text || '',
      canal: 'instagram',
    });
  } catch (err) {
    console.error('Erro no webhook instagram:', err);
  }
});

// ---------------------------------------------------------
// PROCESSAMENTO DA MENSAGEM
// ---------------------------------------------------------
async function processarMensagemRecebida({
  userId,
  numero,
  texto,
  canal,
}) {
  if (!userId || !numero) {
    console.error('Mensagem sem userId ou número/remetente.');
    return;
  }

  let { data: contacto, error: erroContacto } = await supabase
    .from('contactos')
    .select('*')
    .eq('numero', numero)
    .eq('user_id', userId)
    .maybeSingle();

  if (erroContacto) {
    console.error('Erro ao procurar contacto:', erroContacto.message);
    return;
  }

  if (!contacto) {
    const { data: novoContacto, error: erroNovoContacto } = await supabase
      .from('contactos')
      .insert({
        numero,
        canal_origem: canal,
        estado: 'novo',
        user_id: userId,
      })
      .select()
      .single();

    if (erroNovoContacto) {
      console.error(
        'Erro ao criar contacto:',
        erroNovoContacto.message
      );
      return;
    }

    contacto = novoContacto;
  }

  const { error: erroMensagemCliente } = await supabase
    .from('mensagens')
    .insert({
      contacto_id: contacto.id,
      remetente: 'cliente',
      conteudo: texto,
      canal,
    });

  if (erroMensagemCliente) {
    console.error(
      'Erro ao guardar mensagem do cliente:',
      erroMensagemCliente.message
    );
    return;
  }

  await supabase
    .from('contactos')
    .update({
      estado: 'conversando',
      ultima_interacao: new Date().toISOString(),
    })
    .eq('id', contacto.id)
    .eq('user_id', userId);

  const resposta = await responderMensagem({
    contacto,
    texto,
  });

  if (!resposta) return;

  const { error: erroMensagemAgente } = await supabase
    .from('mensagens')
    .insert({
      contacto_id: contacto.id,
      remetente: 'agente',
      conteudo: resposta,
      canal,
    });

  if (erroMensagemAgente) {
    console.error(
      'Erro ao guardar resposta do agente:',
      erroMensagemAgente.message
    );
  }

  if (canal === 'whatsapp') {
    try {
      await enviarMensagemWhatsApp({
        numero,
        texto: resposta,
      });
    } catch (err) {
      console.error(
        'Erro ao enviar resposta pelo WhatsApp:',
        err.response?.data || err.message
      );
    }
  }

  // Espaço reservado para envio via Messenger/Instagram Send API.
}

export default router;
