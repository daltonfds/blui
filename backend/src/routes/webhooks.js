import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { responderMensagem } from '../lib/agente.js';
import { enviarMensagemWhatsApp } from '../lib/whatsapp.js';

const router = Router();

// ---------------------------------------------------------
// VERIFICAÇÃO DO WEBHOOK (Meta exige isto para WhatsApp/Messenger/Instagram)
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
// RECEÇÃO DE MENSAGENS — WhatsApp Cloud API
// ---------------------------------------------------------
router.post('/whatsapp', async (req, res) => {
  res.sendStatus(200); // confirma receção imediatamente (padrão Meta)

  try {
    const entrada = req.body.entry?.[0]?.changes?.[0]?.value;
    const mensagem = entrada?.messages?.[0];
    if (!mensagem) return;

    const numero = mensagem.from;
    const texto = mensagem.text?.body || '';

    await processarMensagemRecebida({
      userId: entrada.metadata?.display_phone_number, // ajustar para o teu mapeamento user/número
      numero,
      texto,
      canal: 'whatsapp',
    });
  } catch (err) {
    console.error('Erro no webhook whatsapp:', err);
  }
});

// ---------------------------------------------------------
// RECEÇÃO DE MENSAGENS — Messenger / Instagram
// ---------------------------------------------------------
router.post('/messenger', async (req, res) => {
  res.sendStatus(200);
  try {
    const evento = req.body.entry?.[0]?.messaging?.[0];
    if (!evento?.message) return;

    await processarMensagemRecebida({
      userId: null,
      numero: evento.sender?.id,
      texto: evento.message.text || '',
      canal: 'messenger',
    });
  } catch (err) {
    console.error('Erro no webhook messenger:', err);
  }
});

router.post('/instagram', async (req, res) => {
  res.sendStatus(200);
  try {
    const evento = req.body.entry?.[0]?.messaging?.[0];
    if (!evento?.message) return;

    await processarMensagemRecebida({
      userId: null,
      numero: evento.sender?.id,
      texto: evento.message.text || '',
      canal: 'instagram',
    });
  } catch (err) {
    console.error('Erro no webhook instagram:', err);
  }
});

// ---------------------------------------------------------
// Lógica partilhada: grava mensagem, atualiza memória, responde
// ---------------------------------------------------------
async function processarMensagemRecebida({ userId, numero, texto, canal }) {
  let { data: contacto } = await supabase
    .from('contactos')
    .select('*')
    .eq('numero', numero)
    .maybeSingle();

  if (!contacto) {
    const { data: novoContacto } = await supabase
      .from('contactos')
      .insert({ numero, canal_origem: canal, estado: 'novo', user_id: userId })
      .select()
      .single();
    contacto = novoContacto;
  }

  await supabase.from('mensagens').insert({
    contacto_id: contacto.id,
    remetente: 'cliente',
    conteudo: texto,
    canal,
  });

  await supabase
    .from('contactos')
    .update({ estado: 'conversando', ultima_interacao: new Date().toISOString() })
    .eq('id', contacto.id);

  const resposta = await responderMensagem({ contacto, texto });

  await supabase.from('mensagens').insert({
    contacto_id: contacto.id,
    remetente: 'agente',
    conteudo: resposta,
    canal,
  });

  if (canal === 'whatsapp') {
    await enviarMensagemWhatsApp({ numero, texto: resposta });
  }
  // Espaço reservado: envio de resposta via Messenger/Instagram Send API
}

export default router;
