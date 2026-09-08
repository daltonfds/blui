import express from 'express';
import twilio from 'twilio';
import {
  sendSMS,
  sendWhatsApp,
} from '../lib/twilio.js';

const router = express.Router();

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

    res.type('text/xml');
    res.send(response.toString());
  }
);

export default router;
