import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';
import { aiJson } from '../services/ai.js';

const router = Router();
router.use(requireAuth);

async function fetchPublic(url) {
  const parsed = new URL(url);
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('URL inválida.');
  const response = await fetch(parsed, { redirect: 'follow', signal: AbortSignal.timeout(12000) });
  const html = await response.text();
  return { finalUrl: response.url, html: html.slice(0, 500000) };
}

function stripHtml(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

router.post('/oferta', async (req, res) => {
  const url = String(req.body?.url || '').trim();
  if (!url) return res.status(400).json({ erro: 'url é obrigatório.' });

  try {
    const page = await fetchPublic(url);
    const text = stripHtml(page.html).slice(0, 30000);

    const fallback = {
      score: null,
      pontos_fortes: [],
      promessas: [],
      copy: text.slice(0, 4000),
      ctas: [],
      percurso: [{ url: page.finalUrl, etapa: 'página analisada' }],
      melhorias: ['Ligar tracking de page_view, CTA, checkout e purchase para medir conversão real.'],
      ab_suggestion: { headline: 'Testar uma promessa mais específica e mensurável.', cta: 'Testar CTA orientado à ação.' },
    };

    const result = await aiJson({
      system: 'Analisa uma página de venda/funil. Identifica proposta de valor, promessas, copy, CTA, percurso e melhorias. Não inventes dados de tráfego. Retorna JSON.',
      user: JSON.stringify({ url: page.finalUrl, texto: text }),
    }) || fallback;

    const { data, error } = await supabase.from('offer_analyses').insert({
      user_id: req.user.id,
      url,
      score: result.score ?? null,
      pontos_fortes: result.pontos_fortes || [],
      promessas: result.promessas || [],
      copy: result.copy || '',
      ctas: result.ctas || [],
      percurso: result.percurso || [],
      melhorias: result.melhorias || [],
      ab_suggestion: result.ab_suggestion || {},
    }).select().single();

    if (error) return res.status(500).json({ erro: error.message });
    res.json(data);
  } catch (err) {
    res.status(422).json({ erro: err.message });
  }
});

router.get('/oferta', async (req, res) => {
  const { data, error } = await supabase.from('offer_analyses')
    .select('*').eq('user_id', req.user.id).order('criado_em', { ascending: false }).limit(50);
  if (error) return res.status(500).json({ erro: error.message });
  res.json(data || []);
});

router.post('/campanha', async (req, res) => {
  const { copy = '', cta = '', destino = '', dados = {} } = req.body;
  const result = await aiJson({
    system: 'Analisa um anúncio digital. Retorna JSON com score, pontos_fortes, fraquezas, promessa, cta, redirecionamento e melhorias.',
    user: JSON.stringify({ copy, cta, destino, dados }),
  }) || {
    score: null,
    pontos_fortes: [],
    fraquezas: [],
    promessa: null,
    cta,
    redirecionamento: destino,
    melhorias: [],
  };
  res.json(result);
});

router.post('/loja-shopify', async (req, res) => {
  const url = String(req.body?.url || '').trim();
  if (!url) return res.status(400).json({ erro: 'url é obrigatório.' });

  try {
    const page = await fetchPublic(url);
    const text = stripHtml(page.html);
    const title = (page.html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '').trim();

    res.json({
      url: page.finalUrl,
      plataforma: /shopify/i.test(page.html) ? 'shopify' : 'desconhecida',
      titulo: title,
      produto_sinais: text.slice(0, 5000),
      visitantes_estimados: null,
      taxa_conversao: null,
      nota: 'Tráfego e conversão reais não são públicos; esses campos ficam null até existir integração de analytics.',
    });
  } catch (err) {
    res.status(422).json({ erro: err.message });
  }
});

// Objeções mais frequentes dos contactos do utilizador autenticado
router.get('/objecoes', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('contactos')
      .select('objeccao')
      .eq('user_id', req.user.id)
      .not('objeccao', 'is', null);

    if (error) {
      return res.status(500).json({ erro: error.message });
    }

    const contagem = {};

    for (const contacto of data || []) {
      const objecao = String(contacto.objeccao || '').trim();

      if (!objecao) continue;

      const chave = objecao.toLowerCase();

      if (!contagem[chave]) {
        contagem[chave] = {
          objecao,
          quantidade: 0,
        };
      }

      contagem[chave].quantidade += 1;
    }

    const objecoes = Object.values(contagem)
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 5);

    res.json({ objecoes });
  } catch (err) {
    res.status(500).json({
      erro: err.message || 'Erro ao analisar objeções.',
    });
  }
});

export default router;
