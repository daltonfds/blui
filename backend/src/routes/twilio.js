const express = require('express');
const twilio = require('twilio');
const {
  sendSMS,
  sendWhatsApp,
} = require('../lib/twilio');

const router = express.Router();

/*
 * Health/configuração — nunca devolve segredos.
 */
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

/*
 * Enviar SMS.
 */
router.post('/sms/send', async (req, res) => {
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

/*
 * Enviar WhatsApp.
 */
router.post('/whatsapp/send', async (req, res) => {
  try {
    const { to, body, mediaUrl } = req.body || {};

    const message = await sendWhatsApp({
      to,
      body,
      mediaUrl,
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

/*
 * Webhook genérico de mensagens recebidas.
 *
 * O Twilio envia:
 * From
 * To
 * Body
 * MessageSid
 * AccountSid
 */
router.post(
  '/webhook',
  express.urlencoded({ extended: false }),
  (req, res) => {
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
      Body,
      MessageSid,
      AccountSid,
    });

    const response = new twilio.twiml.MessagingResponse();

    /*
     * Por enquanto não responde automaticamente.
     * A próxima camada poderá encaminhar a mensagem
     * para o agente BLUI.
     */

    res.type('text/xml');
    res.send(response.toString());
  }
);

module.exports = router;
