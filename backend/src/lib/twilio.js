const twilio = require('twilio');

const required = [
  'TWILIO_ACCOUNT_SID',
  'TWILIO_API_KEY_SID',
  'TWILIO_API_KEY_SECRET',
];

function getConfig() {
  const missing = required.filter((name) => !process.env[name]);

  if (missing.length) {
    const error = new Error(
      `Twilio não configurado. Variáveis em falta: ${missing.join(', ')}`
    );
    error.code = 'TWILIO_NOT_CONFIGURED';
    throw error;
  }

  return {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    apiKeySid: process.env.TWILIO_API_KEY_SID,
    apiKeySecret: process.env.TWILIO_API_KEY_SECRET,

    smsFrom: process.env.TWILIO_SMS_FROM || '',
    whatsappFrom: process.env.TWILIO_WHATSAPP_FROM || '',
  };
}

function getClient() {
  const config = getConfig();

  return twilio(
    config.apiKeySid,
    config.apiKeySecret,
    {
      accountSid: config.accountSid,
    }
  );
}

function normalizeWhatsApp(value) {
  if (!value) return '';

  return value.startsWith('whatsapp:')
    ? value
    : `whatsapp:${value}`;
}

async function sendSMS({ to, body }) {
  const config = getConfig();

  if (!config.smsFrom) {
    throw new Error('TWILIO_SMS_FROM não configurado.');
  }

  if (!to || !body) {
    throw new Error('to e body são obrigatórios.');
  }

  const client = getClient();

  return client.messages.create({
    from: config.smsFrom,
    to,
    body,
  });
}

async function sendWhatsApp({ to, body, mediaUrl }) {
  const config = getConfig();

  if (!config.whatsappFrom) {
    throw new Error('TWILIO_WHATSAPP_FROM não configurado.');
  }

  if (!to || !body) {
    throw new Error('to e body são obrigatórios.');
  }

  const client = getClient();

  const message = {
    from: normalizeWhatsApp(config.whatsappFrom),
    to: normalizeWhatsApp(to),
    body,
  };

  if (mediaUrl) {
    message.mediaUrl = [mediaUrl];
  }

  return client.messages.create(message);
}

module.exports = {
  getConfig,
  getClient,
  sendSMS,
  sendWhatsApp,
};
