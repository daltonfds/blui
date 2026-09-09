import twilio from 'twilio';

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
    whatsappContentSid: process.env.TWILIO_WHATSAPP_CONTENT_SID || '',
    whatsappContentVariables: process.env.TWILIO_WHATSAPP_CONTENT_VARIABLES || '',
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

  return getClient().messages.create({
    from: config.smsFrom,
    to,
    body,
  });
}

async function sendWhatsApp({ to, body, mediaUrl, from, contentVariables }) {
  const config = getConfig();

  const sender = from || config.whatsappFrom;

  if (!sender) {
    throw new Error('Remetente WhatsApp não configurado.');
  }

  if (!to || !body) {
    throw new Error('to e body são obrigatórios.');
  }

  const message = {
    from: normalizeWhatsApp(sender),
    to: normalizeWhatsApp(to),
  };

  if (config.whatsappContentSid) {
    message.contentSid = config.whatsappContentSid;

    const variables = contentVariables || config.whatsappContentVariables;
    if (variables) {
      message.contentVariables =
        typeof variables === 'string'
          ? variables
          : JSON.stringify(variables);
    }
  } else {
    message.body = body;
  }

  if (mediaUrl) {
    message.mediaUrl = [mediaUrl];
  }

  return getClient().messages.create(message);
}

export {
  getConfig,
  getClient,
  sendSMS,
  sendWhatsApp,
  normalizeWhatsApp,
};
