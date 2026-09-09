import twilio from 'twilio';

function getConfig() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID || '';
  const apiKeySid = process.env.TWILIO_API_KEY_SID || '';
  const apiKeySecret = process.env.TWILIO_API_KEY_SECRET || '';

  if (!accountSid || !apiKeySid || !apiKeySecret) {
    throw new Error(
      'Twilio não configurado: TWILIO_ACCOUNT_SID, TWILIO_API_KEY_SID e TWILIO_API_KEY_SECRET são obrigatórios.'
    );
  }

  return {
    accountSid,
    apiKeySid,
    apiKeySecret,
    smsFrom: process.env.TWILIO_SMS_FROM || '',
    whatsappFrom: process.env.TWILIO_WHATSAPP_FROM || '',
    whatsappContentSid:
      process.env.TWILIO_WHATSAPP_CONTENT_SID || '',
    whatsappContentVariables:
      process.env.TWILIO_WHATSAPP_CONTENT_VARIABLES || '',
  };
}

function getClient() {
  const config = getConfig();

  return twilio(
    config.apiKeySid,
    config.apiKeySecret,
    { accountSid: config.accountSid }
  );
}

function normalizeWhatsApp(value) {
  if (!value) return '';

  const clean = String(value).trim();

  return clean.toLowerCase().startsWith('whatsapp:')
    ? clean
    : `whatsapp:${clean}`;
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

async function sendWhatsApp({
  to,
  body,
  mediaUrl,
  from,
  contentSid,
  contentVariables,
}) {
  const config = getConfig();

  const sender = from || config.whatsappFrom;

  if (!sender) {
    throw new Error('Remetente WhatsApp não configurado.');
  }

  if (!to) {
    throw new Error('to é obrigatório.');
  }

  const templateSid =
    contentSid || config.whatsappContentSid || '';

  const message = {
    from: normalizeWhatsApp(sender),
    to: normalizeWhatsApp(to),
  };

  if (templateSid) {
    message.contentSid = templateSid;

    const variables =
      contentVariables ??
      config.whatsappContentVariables;

    if (variables) {
      message.contentVariables =
        typeof variables === 'string'
          ? variables
          : JSON.stringify(variables);
    }
  } else {
    if (!body) {
      throw new Error(
        'body é obrigatório quando não existe ContentSid.'
      );
    }

    message.body = body;
  }

  if (mediaUrl) {
    message.mediaUrl = [mediaUrl];
  }

  console.log('[Twilio outbound]', {
    to: message.to,
    from: message.from,
    contentSid: message.contentSid || null,
  });

  const result =
    await getClient().messages.create(message);

  console.log('[Twilio outbound OK]', {
    sid: result.sid,
    status: result.status,
    errorCode: result.errorCode || null,
  });

  return result;
}

export {
  getConfig,
  getClient,
  sendSMS,
  sendWhatsApp,
  normalizeWhatsApp,
};
