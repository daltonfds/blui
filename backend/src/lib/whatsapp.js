import axios from 'axios';

const GRAPH_VERSION = process.env.META_GRAPH_VERSION || 'v21.0';

export async function enviarMensagemWhatsApp({ numero, texto }) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_TOKEN;

  if (!phoneNumberId || !token) {
    console.warn('WhatsApp não configurado — mensagem não enviada:', texto);
    return null;
  }

  const { data } = await axios.post(
    `https://graph.facebook.com/${GRAPH_VERSION}/${phoneNumberId}/messages`,
    {
      messaging_product: 'whatsapp',
      to: numero,
      type: 'text',
      text: { body: texto },
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return data;
}
