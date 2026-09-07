import axios from 'axios';

const GRAPH_VERSION = process.env.META_GRAPH_VERSION || 'v21.0';

export async function enviarMensagemWhatsApp({
  numero,
  texto,
  accessToken,
  phoneNumberId,
}) {
  const token = accessToken || process.env.WHATSAPP_TOKEN;
  const phoneId = phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!phoneId || !token) {
    console.warn('WhatsApp não configurado — mensagem não enviada.');
    return null;
  }

  const { data } = await axios.post(
    `https://graph.facebook.com/${GRAPH_VERSION}/${phoneId}/messages`,
    {
      messaging_product: 'whatsapp',
      to: String(numero).replace(/\D/g, ''),
      type: 'text',
      text: {
        body: String(texto).slice(0, 4096),
      },
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return data;
}
