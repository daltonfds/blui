import express from 'express';
import twilio from 'twilio';
import crypto from 'crypto';

import {
  sendSMS,
  sendWhatsApp,
} from '../lib/twilio.js';

import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { responderMensagem } from '../lib/agente.js';

const router = express.Router();

const WEBHOOK_URL =
  process.env.TWILIO_WEBHOOK_URL ||
  'https://blui-backend.onrender.com/api/twilio/webhook';

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
  if (
    value === undefined ||
    value === null ||
    value === ''
  ) {
    return null;
  }

  const text = String(value).trim();

  return text
    ? text.slice(0, max)
    : null;
}

function requireTwilioAdmin() {
  const accountSid =
    process.env.TWILIO_ACCOUNT_SID || '';

  const authToken =
    process.env.TWILIO_AUTH_TOKEN || '';

  if (!accountSid || !authToken) {
    throw new Error(
      'TWILIO_ACCOUNT_SID e TWILIO_AUTH_TOKEN são obrigatórios para o onboarding.'
    );
  }

  return {
    accountSid,
    authToken,
  };
}

function encryptSecret(value) {
  const keyValue =
    process.env.TWILIO_ENCRYPTION_KEY || '';

  if (!keyValue) {
    throw new Error(
      'TWILIO_ENCRYPTION_KEY não configurada.'
    );
  }

  const key = crypto
    .createHash('sha256')
    .update(keyValue)
    .digest();

  const iv =
    crypto.randomBytes(12);

  const cipher =
    crypto.createCipheriv(
      'aes-256-gcm',
      key,
      iv
    );

  const encrypted = Buffer.concat([
    cipher.update(String(value), 'utf8'),
    cipher.final(),
  ]);

  const tag =
    cipher.getAuthTag();

  return [
    iv.toString('base64'),
    tag.toString('base64'),
    encrypted.toString('base64'),
  ].join('.');
}

function decryptSecret(value) {
  const keyValue =
    process.env.TWILIO_ENCRYPTION_KEY || '';

  if (!keyValue || !value) {
    throw new Error(
      'Credencial Twilio protegida indisponível.'
    );
  }

  const [
    iv64,
    tag64,
    encrypted64,
  ] = String(value).split('.');

  const key = crypto
    .createHash('sha256')
    .update(keyValue)
    .digest();

  const decipher =
    crypto.createDecipheriv(
      'aes-256-gcm',
      key,
      Buffer.from(iv64, 'base64')
    );

  decipher.setAuthTag(
    Buffer.from(tag64, 'base64')
  );

  const decrypted =
    Buffer.concat([
      decipher.update(
        Buffer.from(
          encrypted64,
          'base64'
        )
      ),
      decipher.final(),
    ]);

  return decrypted.toString('utf8');
}

function twilioBasic(accountSid, authToken) {
  return Buffer
    .from(
      `${accountSid}:${authToken}`
    )
    .toString('base64');
}

async function twilioRequest(
  url,
  {
    method = 'GET',
    accountSid,
    authToken,
    body,
  } = {}
) {
  const response =
    await fetch(url, {
      method,
      headers: {
        Authorization:
          `Basic ${twilioBasic(
            accountSid,
            authToken
          )}`,
        ...(body
          ? {
              'Content-Type':
                'application/json',
            }
          : {}),
      },
      body: body
        ? JSON.stringify(body)
        : undefined,
    });

  const text =
    await response.text();

  let data = {};

  try {
    data =
      text ? JSON.parse(text) : {};
  } catch {
    data = {
      raw: text,
    };
  }

  if (!response.ok) {
    const error =
      new Error(
        data?.message ||
        data?.detail ||
        `Twilio HTTP ${response.status}`
      );

    error.status =
      response.status;

    error.twilio =
      data;

    throw error;
  }

  return data;
}

async function criarSubaccount() {
  const admin =
    requireTwilioAdmin();

  const body =
    new URLSearchParams({
      FriendlyName:
        'BLUI Customer',
    });

  const response =
    await fetch(
      'https://api.twilio.com/2010-04-01/Accounts.json',
      {
        method: 'POST',
        headers: {
          Authorization:
            `Basic ${twilioBasic(
              admin.accountSid,
              admin.authToken
            )}`,
          'Content-Type':
            'application/x-www-form-urlencoded',
        },
        body,
      }
    );

  const text =
    await response.text();

  let data = {};

  try {
    data =
      text ? JSON.parse(text) : {};
  } catch {
    data = {
      raw: text,
    };
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
      `Não foi possível criar o Twilio Subaccount. HTTP ${response.status}`
    );
  }

  return data;
}

async function obterCredenciaisConnection(
  connection
) {
  const encrypted =
    connection?.metadata
      ?.twilio_subaccount_auth;

  if (!encrypted) {
    throw new Error(
      'Credenciais do Subaccount não encontradas.'
    );
  }

  return {
    accountSid:
      connection.twilio_subaccount_sid,
    authToken:
      decryptSecret(encrypted),
  };
}

async function criarSender({
  connection,
  phoneNumber,
  displayName,
  wabaId,
}) {
  const credentials =
    await obterCredenciaisConnection(
      connection
    );

  const payload = {
    sender_id:
      `whatsapp:${phoneNumber}`,
    profile: {
      name:
        displayName ||
        'BLUI',
    },
    webhook: {
      callback_url:
        WEBHOOK_URL,
      callback_method:
        'POST',
    },
  };

  if (wabaId) {
    payload.configuration = {
      waba_id: wabaId,
    };
  }

  return twilioRequest(
    'https://messaging.twilio.com/v2/Channels/Senders',
    {
      method: 'POST',
      accountSid:
        credentials.accountSid,
      authToken:
        credentials.authToken,
      body: payload,
    }
  );
}

async function obterSender(
  connection
) {
  if (!connection?.sender_sid) {
    return null;
  }

  const credentials =
    await obterCredenciaisConnection(
      connection
    );

  return twilioRequest(
    `https://messaging.twilio.com/v2/Channels/Senders/${connection.sender_sid}`,
    {
      accountSid:
        credentials.accountSid,
      authToken:
        credentials.authToken,
    }
  );
}

router.get('/status', (req, res) => {
  res.json({
    configured:
      Boolean(
        process.env.TWILIO_ACCOUNT_SID &&
        (
          process.env.TWILIO_AUTH_TOKEN ||
          (
            process.env.TWILIO_API_KEY_SID &&
            process.env.TWILIO_API_KEY_SECRET
          )
        )
      ),
    onboarding:
      Boolean(
        process.env.TWILIO_ACCOUNT_SID &&
        process.env.TWILIO_AUTH_TOKEN &&
        process.env.TWILIO_ENCRYPTION_KEY
      ),
    webhook:
      WEBHOOK_URL,
  });
});

router.get(
  '/whatsapp/connection',
  requireAuth,
  async (req, res) => {
    try {
      const { data, error } =
        await supabase
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
          .eq(
            'user_id',
            req.user.id
          )
          .maybeSingle();

      if (error) throw error;

      let connection =
        data || null;

      let sender = null;

      if (
        connection?.sender_sid &&
        connection?.twilio_subaccount_sid
      ) {
        try {
          sender =
            await obterSender(
              connection
            );

          const online =
            sender?.status ===
            'ONLINE';

          const nextStatus =
            online
              ? 'connected'
              : connection.status ===
                  'disconnected'
                ? 'disconnected'
                : 'connecting';

          if (
            nextStatus !==
            connection.status
          ) {
            const { data: updated } =
              await supabase
                .from(
                  'whatsapp_connections'
                )
                .update({
                  status:
                    nextStatus,
                  metadata: {
                    ...(connection.metadata ||
                      {}),
                    sender_status:
                      sender?.status ||
                      null,
                    last_status_check:
                      new Date().toISOString(),
                  },
                  updated_at:
                    new Date().toISOString(),
                })
                .eq(
                  'id',
                  connection.id
                )
                .eq(
                  'user_id',
                  req.user.id
                )
                .select('*')
                .single();

            connection =
              updated ||
              connection;
          }
        } catch (senderError) {
          console.warn(
            '[Twilio sender status]',
            senderError.message
          );
        }
      }

      res.json({
        connected:
          connection?.status ===
          'connected',
        connection,
        sender,
      });
    } catch (error) {
      console.error(
        '[WhatsApp connection GET]',
        error
      );

      res.status(500).json({
        erro:
          'Não foi possível carregar a ligação WhatsApp.',
      });
    }
  }
);

router.post(
  '/whatsapp/onboarding/start',
  requireAuth,
  async (req, res) => {
    try {
      requireTwilioAdmin();

      if (
        !process.env.TWILIO_ENCRYPTION_KEY
      ) {
        throw new Error(
          'TWILIO_ENCRYPTION_KEY não configurada.'
        );
      }

      const phoneNumber =
        normalizarTelefone(
          req.body?.phone_number ||
          req.body?.phoneNumber
        );

      const displayName =
        textoOpcional(
          req.body?.display_name ||
          req.body?.displayName,
          120
        ) || 'BLUI';

      const { data: existing } =
        await supabase
          .from(
            'whatsapp_connections'
          )
          .select('*')
          .eq(
            'user_id',
            req.user.id
          )
          .maybeSingle();

      if (
        existing?.twilio_subaccount_sid &&
        existing?.metadata
          ?.twilio_subaccount_auth
      ) {
        const { data, error } =
          await supabase
            .from(
              'whatsapp_connections'
            )
            .update({
              phone_number:
                phoneNumber,
              twilio_from:
                phoneNumber,
              display_name:
                displayName,
              status:
                'connecting',
              provider:
                'twilio',
              channel:
                'twilio_whatsapp',
              updated_at:
                new Date().toISOString(),
            })
            .eq(
              'user_id',
              req.user.id
            )
            .select('*')
            .single();

        if (error) throw error;

        return res.json({
          success: true,
          connection: data,
          meta: {
            appId:
              process.env.META_APP_ID ||
              null,
            configId:
              process.env.META_EMBEDDED_SIGNUP_CONFIG_ID ||
              null,
            ready: Boolean(
              process.env.META_APP_ID &&
              process.env.META_EMBEDDED_SIGNUP_CONFIG_ID
            ),
          },
        });
      }

      const subaccount =
        await criarSubaccount();

      const metadata = {
        onboarding:
          'meta_embedded_signup_v4',
        twilio_subaccount_auth:
          encryptSecret(
            subaccount.auth_token
          ),
        created_by:
          'blui',
        created_at:
          new Date().toISOString(),
      };

      const payload = {
        user_id:
          req.user.id,
        phone_number:
          phoneNumber,
        twilio_from:
          phoneNumber,
        channel:
          'twilio_whatsapp',
        status:
          'connecting',
        display_name:
          displayName,
        provider:
          'twilio',
        twilio_subaccount_sid:
          subaccount.sid,
        metadata,
        updated_at:
          new Date().toISOString(),
      };

      const { data, error } =
        await supabase
          .from(
            'whatsapp_connections'
          )
          .upsert(
            payload,
            {
              onConflict:
                'user_id',
            }
          )
          .select('*')
          .single();

      if (error) throw error;

      res.json({
        success: true,
        connection: data,
        meta: {
          appId:
            process.env.META_APP_ID ||
            null,
          configId:
            process.env.META_EMBEDDED_SIGNUP_CONFIG_ID ||
            null,
          ready: Boolean(
            process.env.META_APP_ID &&
            process.env.META_EMBEDDED_SIGNUP_CONFIG_ID
          ),
        },
      });
    } catch (error) {
      console.error(
        '[WhatsApp onboarding start]',
        error
      );

      res.status(400).json({
        success: false,
        erro:
          error.message ||
          'Não foi possível iniciar o onboarding WhatsApp.',
      });
    }
  }
);

router.post(
  '/whatsapp/onboarding/complete',
  requireAuth,
  async (req, res) => {
    try {
      const phoneNumber =
        normalizarTelefone(
          req.body?.phone_number ||
          req.body?.phoneNumber
        );

      const wabaId =
        textoOpcional(
          req.body?.waba_id ||
          req.body?.wabaId,
          100
        );

      const displayName =
        textoOpcional(
          req.body?.display_name ||
          req.body?.displayName,
          120
        ) || 'BLUI';

      if (!wabaId) {
        throw new Error(
          'WABA ID não recebido pelo Embedded Signup.'
        );
      }

      const { data: connection, error } =
        await supabase
          .from(
            'whatsapp_connections'
          )
          .select('*')
          .eq(
            'user_id',
            req.user.id
          )
          .maybeSingle();

      if (error) throw error;

      if (!connection) {
        throw new Error(
          'Inicia primeiro a conexão WhatsApp.'
        );
      }

      const sender =
        await criarSender({
          connection,
          phoneNumber,
          displayName,
          wabaId,
        });

      const senderStatus =
        sender?.status || 'CREATING';

      const { data: updated, error: updateError } =
        await supabase
          .from(
            'whatsapp_connections'
          )
          .update({
            phone_number:
              phoneNumber,
            twilio_from:
              phoneNumber,
            display_name:
              displayName,
            waba_id:
              wabaId,
            sender_sid:
              sender.sid,
            status:
              senderStatus ===
              'ONLINE'
                ? 'connected'
                : 'connecting',
            provider:
              'twilio',
            channel:
              'twilio_whatsapp',
            metadata: {
              ...(connection.metadata ||
                {}),
              onboarding:
                'meta_embedded_signup_v4',
              sender_status:
                senderStatus,
              sender_created_at:
                new Date().toISOString(),
            },
            updated_at:
              new Date().toISOString(),
          })
          .eq(
            'id',
            connection.id
          )
          .eq(
            'user_id',
            req.user.id
          )
          .select('*')
          .single();

      if (updateError) {
        throw updateError;
      }

      res.json({
        success: true,
        connected:
          updated.status ===
          'connected',
        connection:
          updated,
        sender: {
          sid:
            sender.sid,
          status:
            sender.status,
        },
      });
    } catch (error) {
      console.error(
        '[WhatsApp onboarding complete]',
        error
      );

      res.status(400).json({
        success: false,
        erro:
          error.message ||
          'Não foi possível finalizar a conexão WhatsApp.',
      });
    }
  }
);

router.post(
  '/whatsapp/connection/verificar',
  requireAuth,
  async (req, res) => {
    try {
      const { data: connection, error } =
        await supabase
          .from(
            'whatsapp_connections'
          )
          .select('*')
          .eq(
            'user_id',
            req.user.id
          )
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
            twilio: false,
            sender: false,
            waba: false,
          },
        });
      }

      let sender = null;

      if (
        connection.sender_sid
      ) {
        sender =
          await obterSender(
            connection
          );
      }

      const checks = {
        database: true,
        twilio: Boolean(
          connection
            .twilio_subaccount_sid
        ),
        sender: Boolean(
          connection.sender_sid
        ),
        waba: Boolean(
          connection.waba_id
        ),
        online:
          sender?.status ===
          'ONLINE',
      };

      const verified =
        checks.database &&
        checks.twilio &&
        checks.sender &&
        checks.waba &&
        checks.online;

      const nextStatus =
        verified
          ? 'connected'
          : connection.status ===
              'disconnected'
            ? 'disconnected'
            : 'connecting';

      const metadata = {
        ...(connection.metadata ||
          {}),
        sender_status:
          sender?.status ||
          null,
        last_verification_at:
          new Date().toISOString(),
        verification:
          checks,
      };

      const { data: updated, error: updateError } =
        await supabase
          .from(
            'whatsapp_connections'
          )
          .update({
            status:
              nextStatus,
            metadata,
            updated_at:
              new Date().toISOString(),
          })
          .eq(
            'id',
            connection.id
          )
          .eq(
            'user_id',
            req.user.id
          )
          .select('*')
          .single();

      if (updateError) {
        throw updateError;
      }

      res.json({
        success: true,
        connected: verified,
        verified,
        connection:
          updated,
        sender,
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
          error.message ||
          'Não foi possível verificar a ligação WhatsApp.',
      });
    }
  }
);

router.post(
  '/whatsapp/connection/otp',
  requireAuth,
  async (req, res) => {
    try {
      const otp =
        String(
          req.body?.otp || ''
        ).trim();

      if (!/^\d{4,8}$/.test(otp)) {
        throw new Error(
          'Código OTP inválido.'
        );
      }

      const { data: connection, error } =
        await supabase
          .from(
            'whatsapp_connections'
          )
          .select('*')
          .eq(
            'user_id',
            req.user.id
          )
          .maybeSingle();

      if (error) throw error;

      if (
        !connection?.sender_sid
      ) {
        throw new Error(
          'Sender WhatsApp ainda não foi criado.'
        );
      }

      const credentials =
        await obterCredenciaisConnection(
          connection
        );

      const sender =
        await twilioRequest(
          `https://messaging.twilio.com/v2/Channels/Senders/${connection.sender_sid}`,
          {
            method:
              'POST',
            accountSid:
              credentials.accountSid,
            authToken:
              credentials.authToken,
            body: {
              verification_code:
                otp,
            },
          }
        );

      const online =
        sender?.status ===
        'ONLINE';

      const { data: updated, error: updateError } =
        await supabase
          .from(
            'whatsapp_connections'
          )
          .update({
            status:
              online
                ? 'connected'
                : 'connecting',
            metadata: {
              ...(connection.metadata ||
                {}),
              sender_status:
                sender?.status ||
                null,
              otp_verified_at:
                online
                  ? new Date().toISOString()
                  : null,
            },
            updated_at:
              new Date().toISOString(),
          })
          .eq(
            'id',
            connection.id
          )
          .eq(
            'user_id',
            req.user.id
          )
          .select('*')
          .single();

      if (updateError) {
        throw updateError;
      }

      res.json({
        success: true,
        connected: online,
        connection:
          updated,
        sender,
      });
    } catch (error) {
      console.error(
        '[WhatsApp OTP]',
        error
      );

      res.status(400).json({
        success: false,
        erro:
          error.message ||
          'Não foi possível validar o código OTP.',
      });
    }
  }
);

router.delete(
  '/whatsapp/connection',
  requireAuth,
  async (req, res) => {
    try {
      const { error } =
        await supabase
          .from(
            'whatsapp_connections'
          )
          .update({
            status:
              'disconnected',
            updated_at:
              new Date().toISOString(),
          })
          .eq(
            'user_id',
            req.user.id
          );

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

router.post(
  '/sms/send',
  requireAuth,
  async (req, res) => {
    try {
      const {
        to,
        body,
      } = req.body || {};

      const message =
        await sendSMS({
          to,
          body,
        });

      res.json({
        success: true,
        sid:
          message.sid,
        status:
          message.status,
        channel:
          'sms',
      });
    } catch (error) {
      console.error(
        '[Twilio SMS]',
        error
      );

      res.status(400).json({
        success: false,
        error:
          error.message,
      });
    }
  }
);

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
          .from(
            'whatsapp_connections'
          )
          .select('*')
          .eq(
            'user_id',
            req.user.id
          )
          .eq(
            'status',
            'connected'
          )
          .maybeSingle();

      if (error) throw error;

      if (!connection) {
        throw new Error(
          'Este utilizador não tem WhatsApp ligado.'
        );
      }

      const credentials =
        await obterCredenciaisConnection(
          connection
        );

      const message =
        await sendWhatsApp({
          to,
          body,
          mediaUrl,
          from:
            connection.twilio_from,
          contentSid,
          contentVariables,
          credentials,
        });

      res.json({
        success: true,
        sid:
          message.sid,
        status:
          message.status,
        channel:
          'whatsapp',
      });
    } catch (error) {
      console.error(
        '[Twilio WhatsApp]',
        error
      );

      res.status(400).json({
        success: false,
        error:
          error.message,
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

    try {
      const origem =
        limparNumero(From);

      const destino =
        limparNumero(To);

      const texto =
        String(
          Body || ''
        ).trim();

      if (
        !origem ||
        !destino
      ) {
        return res
          .type('text/xml')
          .send(
            new twilio.twiml.MessagingResponse()
              .toString()
          );
      }

      let query =
        supabase
          .from(
            'whatsapp_connections'
          )
          .select('*')
          .eq(
            'twilio_from',
            destino
          )
          .eq(
            'status',
            'connected'
          );

      if (AccountSid) {
        query =
          query.eq(
            'twilio_subaccount_sid',
            AccountSid
          );
      }

      const {
        data: connections,
        error:
          connectionError,
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
          '[Twilio inbound] Conexão não encontrada',
          {
            destino,
            AccountSid,
          }
        );

        return res
          .type('text/xml')
          .send(
            new twilio.twiml.MessagingResponse()
              .toString()
          );
      }

      const credentials =
        await obterCredenciaisConnection(
          connection
        );

      const signature =
        req.get(
          'X-Twilio-Signature'
        );

      if (
        process.env.TWILIO_VALIDATE_WEBHOOK !==
          'false' &&
        signature
      ) {
        const valid =
          twilio.validateRequest(
            credentials.authToken,
            signature,
            WEBHOOK_URL,
            req.body
          );

        if (!valid) {
          console.warn(
            '[Twilio webhook] assinatura inválida'
          );

          return res
            .status(403)
            .type('text/xml')
            .send(
              '<Response></Response>'
            );
        }
      }

      if (!texto) {
        return res
          .type('text/xml')
          .send(
            new twilio.twiml.MessagingResponse()
              .toString()
          );
      }

      let {
        data: contacto,
        error:
          contactoError,
      } = await supabase
        .from('contactos')
        .select('*')
        .eq(
          'user_id',
          connection.user_id
        )
        .eq(
          'numero',
          origem
        )
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
            nome:
              origem,
            numero:
              origem,
            estado:
              'lead',
            canal_origem:
              'whatsapp',
          })
          .select('*')
          .single();

        if (error) throw error;

        contacto =
          novoContacto;
      }

      const {
        error:
          entradaError,
      } = await supabase
        .from('mensagens')
        .insert({
          contacto_id:
            contacto.id,
          conteudo:
            texto,
          remetente:
            'cliente',
          canal:
            'whatsapp',
        });

      if (entradaError) {
        throw entradaError;
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
        await supabase
          .from('mensagens')
          .insert({
            contacto_id:
              contacto.id,
            conteudo:
              resposta,
            remetente:
              'agente',
            canal:
              'whatsapp',
          });

        await sendWhatsApp({
          to:
            origem,
          body:
            resposta,
          from:
            connection.twilio_from,
          customerServiceWindow:
            true,
          credentials,
        });
      }
    } catch (error) {
      console.error(
        '[Twilio webhook processing]',
        error
      );
    }

    res
      .type('text/xml')
      .send(
        new twilio.twiml.MessagingResponse()
          .toString()
      );
  }
);

export default router;
