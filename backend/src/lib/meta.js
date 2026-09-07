import axios from 'axios';
import crypto from 'crypto';

const GRAPH_VERSION = process.env.META_GRAPH_VERSION || 'v21.0';
const BASE_URL = `https://graph.facebook.com/${GRAPH_VERSION}`;

function hash(valor) {
  if (!valor) return undefined;
  return crypto.createHash('sha256').update(valor.trim().toLowerCase()).digest('hex');
}

// A Meta exige o número normalizado (só dígitos, sem "+") antes de hashear
function hashTelefone(numero) {
  const limpo = String(numero).replace(/\D/g, '');
  return crypto.createHash('sha256').update(limpo).digest('hex');
}

// ---------------------------------------------------------
// CONVERSIONS API
// ---------------------------------------------------------
export async function enviarEventoMetaCAPI({ pixelId, accessToken, evento, contacto, valor, moeda, eventId }) {
  const payload = {
    data: [
      {
        event_name: evento,
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
// PÚBLICOS PERSONALIZADOS (Custom Audiences) a partir de números
// ---------------------------------------------------------
async function criarPublicoPersonalizado({ adAccountId, accessToken, nome, numeros }) {
  if (!numeros || numeros.length === 0) return null;

  // 1. Cria o "recipiente" do público
  const audiencia = await axios.post(
    `${BASE_URL}/act_${adAccountId}/customaudiences`,
    {
      name: nome,
      subtype: 'CUSTOM',
      description: 'Criado automaticamente pela BLUI a partir de números importados',
      customer_file_source: 'USER_PROVIDED_ONLY',
    },
    { params: { access_token: accessToken } }
  );

  const audienceId = audiencia.data.id;

  // 2. Envia os números hasheados (a Meta nunca recebe o número em claro)
  const schema = ['PHONE_SHA256'];
  const data = numeros.map((n) => [hashTelefone(n)]);

  await axios.post(
    `${BASE_URL}/${audienceId}/users`,
    {
      payload: { schema, data },
    },
    { params: { access_token: accessToken } }
  );

  return audienceId;
}

// ---------------------------------------------------------
// MARKETING API — criação automática de campanha/adset/anúncio
// ---------------------------------------------------------
export async function criarCampanhaCompleta({ adAccountId, accessToken, pageId, pixelId, config }) {
  const {
    nomeProduto,
    sobreProduto,
    orcamentoDiario,
    objetivo,
    publico,
    imagemUrl,
    numerosIncluir,
    numerosExcluir,
  } = config;

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

  // 1.5 Cria os públicos personalizados de incluir/excluir, se houver números
  const sufixo = new Date().toISOString().slice(0, 10);

  const audienceIncluirId = await criarPublicoPersonalizado({
    adAccountId,
    accessToken,
    nome: `${nomeProduto} - Incluir - ${sufixo}`,
    numeros: numerosIncluir,
  });

  const audienceExcluirId = await criarPublicoPersonalizado({
    adAccountId,
    accessToken,
    nome: `${nomeProduto} - Excluir - ${sufixo}`,
    numeros: numerosExcluir,
  });

  const targeting = {
    ...(publico || { geo_locations: { countries: ['MZ'] }, age_min: 18, age_max: 55 }),
    ...(audienceIncluirId ? { custom_audiences: [{ id: audienceIncluirId }] } : {}),
    ...(audienceExcluirId ? { excluded_custom_audiences: [{ id: audienceExcluirId }] } : {}),
  };

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
      targeting,
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
    audienceIncluirId,
    audienceExcluirId,
  };
}
