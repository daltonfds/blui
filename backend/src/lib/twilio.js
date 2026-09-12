import twilio from 'twilio';

function getConfig() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID || '';
  const apiKeySid = process.env.TWILIO_API_KEY_SID || '';
  const apiKeySecret = process.env.TWILIO_API_KEY_SECRET || '';
  const authToken = process.env.TWILIO_AUTH_TOKEN || '';

  if (!accountSid || (!authToken && (!apiKeySid || !apiKeySecret))) {
    throw new Error(
      'Twilio não configurado: TWILIO_ACCOUNT_SID e credenciais Twilio são obrigatórios.'
    );
  }

  return {
    accountSid,
    apiKeySid,
    apiKeySecret,
    authToken,
    smsFrom: process.env.TWILIO_SMS_FROM || '',
    whatsappFrom: process.env.TWILIO_WHATSAPP_FROM || '',
    whatsappContentSid:
      process.env.TWILIO_WHATSAPP_CONTENT_SID || '',
    whatsappContentVariables:
      process.env.TWILIO_WHATSAPP_CONTENT_VARIABLES || '',
  };
}

function getClient(credentials = {}) {
  const config = getConfig();

  const accountSid =
    credentials.accountSid || config.accountSid;

  const authToken =
    credentials.authToken || config.authToken;

  if (
    credentials.apiKeySid &&
    credentials.apiKeySecret
  ) {
    return twilio(
      credentials.apiKeySid,
      credentials.apiKeySecret,
      { accountSid }
    );
  }

  if (authToken) {
    return twilio(accountSid, authToken);
  }

  return twilio(
    config.apiKeySid,
    config.apiKeySecret,
    { accountSid }
  );
}

function normalizeWhatsApp(value) {
  if (!value) return '';

  const clean = String(value).trim();

  return clean
    .toLowerCase()
    .startsWith('whatsapp:')
    ? clean
    : `whatsapp:${clean}`;
}

async function sendSMS({
  to,
  body,
  from,
  credentials,
}) {
  const config = getConfig();

  const sender =
    from || config.smsFrom;

  if (!sender) {
    throw new Error(
      'Remetente SMS não configurado.'
    );
  }

  if (!to) {
    throw new Error('to é obrigatório.');
  }

  if (!body) {
    throw new Error('body é obrigatório.');
  }

  return getClient(credentials).messages.create({
    to: String(to).trim(),
    from: String(sender).trim(),
    body: String(body),
  });
}

async function sendWhatsApp({
  to,
  body,
  mediaUrl,
  from,
  contentSid,
  contentVariables,
  customerServiceWindow = false,
  credentials,
}) {
  const config = getConfig();

  const sender =
    from || config.whatsappFrom;

  if (!sender) {
    throw new Error(
      'Remetente WhatsApp não configurado.'
    );
  }

  if (!to) {
    throw new Error('to é obrigatório.');
  }

  const templateSid =
    contentSid ||
    config.whatsappContentSid ||
    '';

  const message = {
    from: normalizeWhatsApp(sender),
    to: normalizeWhatsApp(to),
  };

  const useTemplate =
    Boolean(templateSid) &&
    !customerServiceWindow;

  if (useTemplate) {
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

  return getClient(credentials).messages.create(
    message
  );
}

export {
  getConfig,
  getClient,
  sendSMS,
  sendWhatsApp,
  normalizeWhatsApp,
};
