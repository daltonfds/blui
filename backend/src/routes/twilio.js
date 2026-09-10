import express from 'express';
import twilio from 'twilio';

import {
  sendSMS,
  sendWhatsApp,
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
      'Número WhatsApp inválido. Usa o formato internacional.'
    );
  }

  return numero;
}

function textoOpcional(value, max = 255) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const text = String(value).trim();

  return text ? text.slice(0, max) : null;
}

function twilioConfigurado() {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_API_KEY_SID &&
    process.env.TWILIO_API_KEY_SECRET
  );
}

router.get('/status', (req, res) => {
  res.json({
    configured: twilioConfigurado(),
    sms: Boolean(process.env.TWILIO_SMS_FROM),
    whatsapp: Boolean(process.env.TWILIO_WHATSAPP_FROM),
  });
});

router.get('/whatsapp/connection', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('whatsapp_connections')
      .select(`
        id,
        user_id,
        phone_number,
        twilio_from,
        channel,
        status,
        display_name,
        waba_id,
        sender_sid,
        twilio_subaccount_sid,
        provider,
        metadata,
        created_at,
        updated_at
      `)
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (error) throw error;

    res.json({
      connected: data?.status === 'connected',
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
    const phoneNumber = normalizarTelefone(
      req.body?.phone_number ?? req.body?.phoneNumber
    );

    const displayName = textoOpcional(
      req.body?.display_name ?? req.body?.displayName,
      120
    );

    const wabaId = textoOpcional(
      req.body?.waba_id ?? req.body?.wabaId,
      100
    );

    const senderSid = textoOpcional(
      req.body?.sender_sid ?? req.body?.senderSid,
      100
    );

    const twilioSubaccountSid = textoOpcional(
      req.body?.twilio_subaccount_sid ??
        req.body?.twilioSubaccountSid,
      100
    );

    const configuredSender = process.env.TWILIO_WHATSAPP_FROM
      ? limparNumero(process.env.TWILIO_WHATSAPP_FROM)
      : '';

    const twilioFrom = configuredSender || phoneNumber;

    const payload = {
      user_id: req.user.id,
      phone_number: phoneNumber,
      twilio_from: twilioFrom,
      channel: 'twilio_whatsapp',
      status: 'connected',
      display_name: displayName,
      waba_id: wabaId,
      sender_sid: senderSid,
      twilio_subaccount_sid: twilioSubaccountSid,
      provider: 'twilio',
      metadata: {
        onboarding:
          senderSid || wabaId
            ? 'embedded_signup_or_api'
            : 'manual',
      },
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('whatsapp_connections')
      .upsert(payload, {
        onConflict: 'user_id',
      })
      .select(`
        id,
        user_id,
        phone_number,
        twilio_from,
        channel,
        status,
        display_name,
        waba_id,
        sender_sid,
        twilio_subaccount_sid,
        provider,
        metadata,
        created_at,
        updated_at
      `)
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
      erro:
        error.message ||
        'Não foi possível ligar o WhatsApp.',
    });
  }
});

router.post(
  '/whatsapp/connection/verificar',
  requireAuth,
  async (req, res) => {
    try {
      const { data: connection, error } = await supabase
        .from('whatsapp_connections')
        .select(`
          id,
          phone_number,
          twilio_from,
          status,
          display_name,
          waba_id,
          sender_sid,
          twilio_subaccount_sid,
          provider,
          metadata,
          updated_at
        `)
        .eq('user_id', req.user.id)
        .maybeSingle();

      if (error) throw error;

      if (!connection) {
        return res.json({
          success: true,
          connected: false,
          verified: false,
          connection: null,
          checks: {
            database: false,
            twilio: twilioConfigurado(),
            sender: false,
            waba: false,
          },
        });
      }

      const checks = {
        database: true,
        twilio: twilioConfigurado(),
        sender: Boolean(
          connection.sender_sid ||
          connection.twilio_from
        ),
        waba: Boolean(connection.waba_id),
      };

      const verified =
        connection.status === 'connected' &&
        checks.twilio &&
        checks.sender;

      const metadata = {
        ...(connection.metadata || {}),
        last_verification_at:
          new Date().toISOString(),
        verification: checks,
      };

      const { data: updated, error: updateError } =
        await supabase
          .from('whatsapp_connections')
          .update({
            metadata,
            updated_at:
              new Date().toISOString(),
          })
          .eq('id', connection.id)
          .eq('user_id', req.user.id)
          .select(`
            id,
            phone_number,
            twilio_from,
            status,
            display_name,
            waba_id,
            sender_sid,
            twilio_subaccount_sid,
            provider,
            metadata,
            updated_at
          `)
          .single();

      if (updateError) throw updateError;

      res.json({
        success: true,
        connected:
          connection.status === 'connected',
        verified,
        connection: updated,
        checks,
      });
    } catch (error) {
      console.error(
        '[WhatsApp connection VERIFY]',
        error
      );

      res.status(500).json({
        success: false,
        erro:
          'Não foi possível verificar a ligação WhatsApp.',
      });
    }
  }
);

router.delete(
  '/whatsapp/connection',
  requireAuth,
  async (req, res) => {
    try {
      const { error } = await supabase
        .from('whatsapp_connections')
        .update({
          status: 'disconnected',
          updated_at:
            new Date().toISOString(),
        })
        .eq('user_id', req.user.id);

      if (error) throw error;

      res.json({
        success: true,
        connected: false,
      });
    } catch (error) {
      console.error(
        '[WhatsApp connection DELETE]',
        error
      );

      res.status(500).json({
        erro:
          'Não foi possível desligar o WhatsApp.',
      });
    }
  }
);

router.post('/sms/send', requireAuth, async (req, res) => {
  try {
    const { to, body } = req.body || {};

    const message = await sendSMS({
      to,
      body,
    });

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

router.post(
  '/whatsapp/send',
  requireAuth,
  async (req, res) => {
    try {
      const {
        to,
        body,
        mediaUrl,
        contentSid,
        contentVariables,
      } = req.body || {};

      const { data: connection, error } =
        await supabase
          .from('whatsapp_connections')
          .select(`
            twilio_from,
            status,
            sender_sid,
            twilio_subaccount_sid
          `)
          .eq('user_id', req.user.id)
          .eq('status', 'connected')
          .maybeSingle();

      if (error) throw error;

      const from =
        connection?.twilio_from ||
        process.env.TWILIO_WHATSAPP_FROM;

      if (!from) {
        throw new Error(
          'Este utilizador não tem WhatsApp ligado.'
        );
      }

      const message = await sendWhatsApp({
        to,
        body,
        mediaUrl,
        from,
        contentSid,
        contentVariables,
      });

      res.json({
        success: true,
        sid: message.sid,
        status: message.status,
        channel: 'whatsapp',
        sender_sid:
          connection?.sender_sid || null,
        twilio_subaccount_sid:
          connection?.twilio_subaccount_sid || null,
      });
    } catch (error) {
      console.error(
        '[Twilio WhatsApp]',
        error
      );

      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
);

router.post(
  '/webhook',
  express.urlencoded({
    extended: false,
  }),
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
      const texto = String(
        Body || ''
      ).trim();

      if (
        !origem ||
        !destino ||
        !texto
      ) {
        const response =
          new twilio.twiml.MessagingResponse();

        res.type('text/xml');

        return res.send(
          response.toString()
        );
      }

      let query = supabase
        .from('whatsapp_connections')
        .select('*')
        .eq('twilio_from', destino)
        .eq('status', 'connected');

      if (AccountSid) {
        query = query.or(
          `twilio_subaccount_sid.eq.${AccountSid},twilio_subaccount_sid.is.null`
        );
      }

      const {
        data: connections,
        error: connectionError,
      } = await query.limit(2);

      if (connectionError) {
        throw connectionError;
      }

      const connection =
        connections?.length === 1
          ? connections[0]
          : null;

      if (!connection) {
        console.warn(
          '[Twilio inbound] Nenhum utilizador encontrado:',
          destino,
          AccountSid || ''
        );

        const response =
          new twilio.twiml.MessagingResponse();

        res.type('text/xml');

        return res.send(
          response.toString()
        );
      }

      let {
        data: contacto,
        error: contactoError,
      } = await supabase
        .from('contactos')
        .select('*')
        .eq(
          'user_id',
          connection.user_id
        )
        .eq('numero', origem)
        .maybeSingle();

      if (contactoError) {
        throw contactoError;
      }

      if (!contacto) {
        const {
          data: novoContacto,
          error,
        } = await supabase
          .from('contactos')
          .insert({
            user_id:
              connection.user_id,
            nome: origem,
            numero: origem,
            estado: 'lead',
            canal_origem:
              'whatsapp',
          })
          .select('*')
          .single();

        if (error) throw error;

        contacto = novoContacto;
      }

      const {
        error:
          mensagemEntradaError,
      } = await supabase
        .from('mensagens')
        .insert({
          contacto_id:
            contacto.id,
          conteudo: texto,
          remetente: 'cliente',
          canal: 'whatsapp',
        });

      if (mensagemEntradaError) {
        throw mensagemEntradaError;
      }

      await supabase
        .from('contactos')
        .update({
          ultima_interacao:
            new Date().toISOString(),
        })
        .eq(
          'id',
          contacto.id
        )
        .eq(
          'user_id',
          connection.user_id
        );

      const resposta =
        await responderMensagem({
          contacto,
          texto,
        });

      if (resposta) {
        const {
          error:
            mensagemSaidaError,
        } = await supabase
          .from('mensagens')
          .insert({
            contacto_id:
              contacto.id,
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
          from:
            connection.twilio_from,
          customerServiceWindow:
            true,
        });
      }
    } catch (error) {
      console.error(
        '[Twilio webhook processing]',
        error
      );
    }

    const response =
      new twilio.twiml.MessagingResponse();

    res.type('text/xml');

    res.send(
      response.toString()
    );
  }
);

export default router;
