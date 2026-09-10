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
    {
      accountSid: config.accountSid,
    }
  );
}

function normalizeWhatsApp(value) {
  if (!value) return '';

  const clean = String(value).trim();

  return clean.toLowerCase().startsWith('whatsapp:')
    ? clean
    : `whatsapp:${clean}`;
}

async function sendSMS({ to, body, from }) {
  const config = getConfig();
  const sender = from || config.smsFrom;

  if (!sender) {
    throw new Error('Remetente SMS não configurado.');
  }

  if (!to) {
    throw new Error('to é obrigatório.');
  }

  if (!body) {
    throw new Error('body é obrigatório.');
  }

  console.log('[Twilio SMS outbound]', {
    to,
    from: sender,
  });

  const result = await getClient().messages.create({
    to: String(to).trim(),
    from: String(sender).trim(),
    body: String(body),
  });

  console.log('[Twilio SMS outbound OK]', {
    sid: result.sid,
    status: result.status,
    errorCode: result.errorCode || null,
  });

  return result;
}

async function sendWhatsApp({
  to,
  body,
  mediaUrl,
  from,
  contentSid,
  contentVariables,
  customerServiceWindow = false,
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
    contentSid ||
    config.whatsappContentSid ||
    '';

  const message = {
    from: normalizeWhatsApp(sender),
    to: normalizeWhatsApp(to),
  };

  const useTemplate =
    Boolean(templateSid) && !customerServiceWindow;

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

  console.log('[Twilio outbound]', {
    to: message.to,
    from: message.from,
    mode: message.contentSid ? 'template' : 'free-form',
    contentSid: message.contentSid || null,
    customerServiceWindow,
  });

  try {
    const result =
      await getClient().messages.create(message);

    console.log('[Twilio outbound OK]', {
      sid: result.sid,
      status: result.status,
      errorCode: result.errorCode || null,
      mode: message.contentSid ? 'template' : 'free-form',
    });

    return result;
  } catch (error) {
    console.error('[Twilio outbound ERROR]', {
      status: error?.status || null,
      code: error?.code || null,
      message: error?.message || null,
      mode: message.contentSid ? 'template' : 'free-form',
    });

    if (
      customerServiceWindow &&
      !message.contentSid &&
      Number(error?.code) === 21654 &&
      templateSid
    ) {
      console.warn(
        '[Twilio fallback] ContentSid obrigatório. Tentando template configurado.'
      );

      const fallbackMessage = {
        from: message.from,
        to: message.to,
        contentSid: templateSid,
      };

      const variables =
        contentVariables ??
        config.whatsappContentVariables;

      if (variables) {
        fallbackMessage.contentVariables =
          typeof variables === 'string'
            ? variables
            : JSON.stringify(variables);
      }

      const fallback =
        await getClient().messages.create(fallbackMessage);

      console.log('[Twilio fallback OK]', {
        sid: fallback.sid,
        status: fallback.status,
        errorCode: fallback.errorCode || null,
        mode: 'template-fallback',
        contentSid: templateSid,
      });

      return fallback;
    }

    throw error;
  }
}

export {
  getConfig,
  getClient,
  sendSMS,
  sendWhatsApp,
  normalizeWhatsApp,
};
