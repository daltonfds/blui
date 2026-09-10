import express from 'express';
import twilio from 'twilio';

import {
  sendSMS,
  sendWhatsApp,
  normalizeWhatsApp,
} from '../lib/twilio.js';

import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { responderMensagem } from '../lib/agente.js';

const router = express.Router();

function limparNumero(value) {
  return String(value || '')
    .trim()
    .replace(/^whatsapp:/i, '');
}

function normalizarTelefone(value) {
  const numero = limparNumero(value);

  if (!/^\+\d{8,15}$/.test(numero)) {
    throw new Error(
      'Número WhatsApp inválido. Usa o formato internacional, por exemplo +258XXXXXXXXX.'
    );
  }

  return numero;
}

router.get('/status', (req, res) => {
  const configured = Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_API_KEY_SID &&
    process.env.TWILIO_API_KEY_SECRET
  );

  res.json({
    configured,
    sms: Boolean(process.env.TWILIO_SMS_FROM),
    whatsapp: Boolean(process.env.TWILIO_WHATSAPP_FROM),
  });
});

router.get('/whatsapp/connection', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('whatsapp_connections')
      .select('*')
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (error) throw error;

    res.json({
      connected: Boolean(data),
      connection: data || null,
    });
  } catch (error) {
    console.error('[WhatsApp connection GET]', error);

    res.status(500).json({
      erro: 'Não foi possível carregar a ligação WhatsApp.',
    });
  }
});

router.post('/whatsapp/connection', requireAuth, async (req, res) => {
  try {
    const phoneNumber = normalizarTelefone(req.body?.phoneNumber);

    const configuredSender = process.env.TWILIO_WHATSAPP_FROM
      ? limparNumero(process.env.TWILIO_WHATSAPP_FROM)
      : '';

    const twilioFrom = configuredSender || phoneNumber;

    if (!twilioFrom) {
      throw new Error('TWILIO_WHATSAPP_FROM não configurado.');
    }

    const payload = {
      user_id: req.user.id,
      phone_number: phoneNumber,
      twilio_from: twilioFrom,
      channel: 'twilio_whatsapp',
      status: 'connected',
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('whatsapp_connections')
      .upsert(payload, {
        onConflict: 'user_id',
      })
      .select('*')
      .single();

    if (error) throw error;

    res.json({
      success: true,
      connected: true,
      connection: data,
    });
  } catch (error) {
    console.error('[WhatsApp connection POST]', error);

    res.status(400).json({
      erro: error.message || 'Não foi possível ligar o WhatsApp.',
    });
  }
});

router.delete('/whatsapp/connection', requireAuth, async (req, res) => {
  try {
    const { error } = await supabase
      .from('whatsapp_connections')
      .delete()
      .eq('user_id', req.user.id);

    if (error) throw error;

    res.json({
      success: true,
      connected: false,
    });
  } catch (error) {
    console.error('[WhatsApp connection DELETE]', error);

    res.status(500).json({
      erro: 'Não foi possível desligar o WhatsApp.',
    });
  }
});

router.post('/sms/send', requireAuth, async (req, res) => {
  try {
    const { to, body } = req.body || {};

    const message = await sendSMS({ to, body });

    res.json({
      success: true,
      sid: message.sid,
      status: message.status,
      channel: 'sms',
    });
  } catch (error) {
    console.error('[Twilio SMS]', error);

    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

router.post('/whatsapp/send', requireAuth, async (req, res) => {
  try {
    const { to, body, mediaUrl } = req.body || {};

    const { data: connection, error } = await supabase
      .from('whatsapp_connections')
      .select('twilio_from')
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (error) throw error;

    const from = connection?.twilio_from || process.env.TWILIO_WHATSAPP_FROM;

    if (!from) {
      throw new Error('Este utilizador não tem WhatsApp ligado.');
    }

    const message = await sendWhatsApp({
      to,
      body,
      mediaUrl,
      from,
    });

    res.json({
      success: true,
      sid: message.sid,
      status: message.status,
      channel: 'whatsapp',
    });
  } catch (error) {
    console.error('[Twilio WhatsApp]', error);

    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

router.post(
  '/webhook',
  express.urlencoded({ extended: false }),
  async (req, res) => {
    const {
      From,
      To,
      Body,
      MessageSid,
      AccountSid,
    } = req.body || {};

    console.log('[Twilio inbound]', {
      From,
      To,
      MessageSid,
      AccountSid,
    });

    try {
      const origem = limparNumero(From);
      const destino = limparNumero(To);
      const texto = String(Body || '').trim();

      if (!origem || !destino || !texto) {
        const response = new twilio.twiml.MessagingResponse();

        res.type('text/xml');
        return res.send(response.toString());
      }

      const { data: connection, error: connectionError } = await supabase
        .from('whatsapp_connections')
        .select('*')
        .eq('twilio_from', destino)
        .eq('status', 'connected')
        .maybeSingle();

      if (connectionError) throw connectionError;

      if (!connection) {
        console.warn(
          '[Twilio inbound] Nenhum utilizador encontrado para:',
          destino
        );

        const response = new twilio.twiml.MessagingResponse();

        res.type('text/xml');
        return res.send(response.toString());
      }

      let { data: contacto, error: contactoError } = await supabase
        .from('contactos')
        .select('*')
        .eq('user_id', connection.user_id)
        .eq('numero', origem)
        .maybeSingle();

      if (contactoError) throw contactoError;

      if (!contacto) {
        const { data: novoContacto, error } = await supabase
          .from('contactos')
          .insert({
            user_id: connection.user_id,
            nome: origem,
            numero: origem,
            estado: 'lead',
            canal_origem: 'whatsapp',
          })
          .select('*')
          .single();

        if (error) throw error;

        contacto = novoContacto;
      }

      const { error: mensagemEntradaError } = await supabase
        .from('mensagens')
        .insert({
          contacto_id: contacto.id,
          conteudo: texto,
          remetente: 'cliente',
          canal: 'whatsapp',
        });

      if (mensagemEntradaError) {
        throw mensagemEntradaError;
      }

      await supabase
        .from('contactos')
        .update({ ultima_interacao: new Date().toISOString() })
        .eq('id', contacto.id)
        .eq('user_id', connection.user_id);

      const resposta = await responderMensagem({
        contacto,
        texto,
      });

      if (resposta) {
        const { error: mensagemSaidaError } = await supabase
          .from('mensagens')
          .insert({
            contacto_id: contacto.id,
            conteudo: resposta,
            remetente: 'agente',
            canal: 'whatsapp',
          });

        if (mensagemSaidaError) {
          throw mensagemSaidaError;
        }

        await sendWhatsApp({
          to: origem,
          body: resposta,
          from: connection.twilio_from,
          customerServiceWindow: true,
        });
      }
    } catch (error) {
      console.error('[Twilio webhook processing]', error);
    }

    const response = new twilio.twiml.MessagingResponse();

    res.type('text/xml');
    res.send(response.toString());
  }
);

export default router;
