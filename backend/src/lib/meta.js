import axios from 'axios';
import crypto from 'crypto';

const GRAPH_VERSION = process.env.META_GRAPH_VERSION || 'v21.0';
const BASE_URL = `https://graph.facebook.com/${GRAPH_VERSION}`;

function hash(valor) {
  if (!valor) return undefined;
  return crypto.createHash('sha256').update(valor.trim().toLowerCase()).digest('hex');
}

// ---------------------------------------------------------
// CONVERSIONS API — envia eventos de conversão server-side
// (contorna perda de dados por cookies/ad blockers)
// ---------------------------------------------------------
export async function enviarEventoMetaCAPI({ pixelId, accessToken, evento, contacto, valor, moeda, eventId }) {
  const payload = {
    data: [
      {
        event_name: evento, // 'Purchase' | 'Lead' | 'AddToCart' | 'InitiateCheckout'
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: 'chat',
        user_data: {
          ph: contacto?.numero ? [hash(contacto.numero)] : undefined,
          em: contacto?.email ? [hash(contacto.email)] : undefined,
        },
        custom_data: {
          currency: moeda || 'MZN',
          value: valor || 0,
        },
      },
    ],
  };

  const { data } = await axios.post(
    `${BASE_URL}/${pixelId}/events`,
    payload,
    { params: { access_token: accessToken } }
  );

  return data;
}

// ---------------------------------------------------------
// MARKETING API — criação automática de campanha/adset/anúncio
// ---------------------------------------------------------
export async function criarCampanhaCompleta({ adAccountId, accessToken, pageId, pixelId, config }) {
  const { nomeProduto, sobreProduto, orcamentoDiario, objetivo, publico, imagemUrl } = config;

  // 1. Campanha
  const campanha = await axios.post(
    `${BASE_URL}/act_${adAccountId}/campaigns`,
    {
      name: `${nomeProduto} - ${new Date().toISOString().slice(0, 10)}`,
      objective: objetivo || 'OUTCOME_ENGAGEMENT',
      status: 'PAUSED',
      special_ad_categories: [],
    },
    { params: { access_token: accessToken } }
  );

  // 2. Conjunto de anúncios
  const adset = await axios.post(
    `${BASE_URL}/act_${adAccountId}/adsets`,
    {
      name: `${nomeProduto} - Conjunto`,
      campaign_id: campanha.data.id,
      daily_budget: Math.round((orcamentoDiario || 5) * 100),
      billing_event: 'IMPRESSIONS',
      optimization_goal: 'CONVERSATIONS',
      bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
      targeting: publico || { geo_locations: { countries: ['MZ'] }, age_min: 18, age_max: 55 },
      status: 'PAUSED',
      promoted_object: pixelId ? { pixel_id: pixelId, custom_event_type: 'LEAD' } : undefined,
    },
    { params: { access_token: accessToken } }
  );

  // 3. Criativo
  const creative = await axios.post(
    `${BASE_URL}/act_${adAccountId}/adcreatives`,
    {
      name: `${nomeProduto} - Criativo`,
      object_story_spec: {
        page_id: pageId,
        link_data: {
          message: sobreProduto || nomeProduto,
          link: config.linkDestino || 'https://wa.me/',
          picture: imagemUrl,
          call_to_action: { type: 'MESSAGE_PAGE' },
        },
      },
    },
    { params: { access_token: accessToken } }
  );

  // 4. Anúncio
  const anuncio = await axios.post(
    `${BASE_URL}/act_${adAccountId}/ads`,
    {
      name: `${nomeProduto} - Anúncio`,
      adset_id: adset.data.id,
      creative: { creative_id: creative.data.id },
      status: 'PAUSED',
    },
    { params: { access_token: accessToken } }
  );

  return {
    campaignId: campanha.data.id,
    adsetId: adset.data.id,
    creativeId: creative.data.id,
    adId: anuncio.data.id,
  };
}
