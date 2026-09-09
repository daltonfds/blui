const twilio = require("twilio");

const config = {
  accountSid: process.env.TWILIO_ACCOUNT_SID || "",
  apiKeySid: process.env.TWILIO_API_KEY_SID || "",
  apiKeySecret: process.env.TWILIO_API_KEY_SECRET || "",
  whatsappContentSid: process.env.TWILIO_WHATSAPP_CONTENT_SID || "",
};

function getClient() {
  if (!config.accountSid || !config.apiKeySid || !config.apiKeySecret) {
    throw new Error("Twilio credentials are not configured");
  }

  return twilio(
    config.apiKeySid,
    config.apiKeySecret,
    {
      accountSid: config.accountSid,
    }
  );
}

function normalizeWhatsApp(value) {
  if (!value) return value;

  const clean = String(value).trim();

  if (clean.startsWith("whatsapp:")) {
    return clean;
  }

  return `whatsapp:${clean}`;
}

async function sendWhatsApp({
  to,
  body,
  mediaUrl,
  from,
  contentSid,
  contentVariables,
}) {
  const client = getClient();

  const sender =
    from ||
    process.env.TWILIO_WHATSAPP_FROM ||
    "";

  const message = {
    from: normalizeWhatsApp(sender),
    to: normalizeWhatsApp(to),
  };

  const templateSid =
    contentSid ||
    config.whatsappContentSid ||
    "";

  if (templateSid) {
    message.contentSid = templateSid;

    if (contentVariables !== undefined && contentVariables !== null) {
      message.contentVariables =
        typeof contentVariables === "string"
          ? contentVariables
          : JSON.stringify(contentVariables);
    }
  } else {
    message.body = body || "";
  }

  if (mediaUrl) {
    message.mediaUrl = [mediaUrl];
  }

  return client.messages.create(message);
}

module.exports = {
  sendWhatsApp,
  normalizeWhatsApp,
};
