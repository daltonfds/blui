import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { criarCampanhaCompleta } from '../lib/meta.js';

const router = Router();
router.use(requireAuth);

// Liga uma conta de anúncios (chamado depois do OAuth do Facebook no frontend)
router.post('/contas', async (req, res) => {
  const payload = { ...req.body, user_id: req.user.id };
  const { data, error } = await supabase
    .from('contas_anuncio')
    .insert(payload)
    .select()
    .single();

  if (error) return res.status(400).json({ erro: error.message });
  res.json(data);
});

router.get('/contas', async (req, res) => {
  const { data, error } = await supabase
    .from('contas_anuncio')
    .select('id, plataforma, ad_account_id, page_id, pixel_id, ligado_em')
    .eq('user_id', req.user.id);

  if (error) return res.status(400).json({ erro: error.message });
  res.json(data);
});

// Cria campanha automática assim que o assinante confirma o wizard
router.post('/criar-automatica', async (req, res) => {
  const { contaAnuncioId, produtoId, orcamentoDiario, linkDestino, imagemUrl } = req.body;

  const { data: conta, error: erroConta } = await supabase
    .from('contas_anuncio')
    .select('*')
    .eq('id', contaAnuncioId)
    .eq('user_id', req.user.id)
    .single();

  if (erroConta || !conta) return res.status(404).json({ erro: 'Conta de anúncios não encontrada.' });

  const { data: produto, error: erroProduto } = await supabase
    .from('produtos')
    .select('*')
    .eq('id', produtoId)
    .eq('user_id', req.user.id)
    .single();

  if (erroProduto || !produto) return res.status(404).json({ erro: 'Produto não encontrado.' });

  // Regra: só usar público avançado (segmentado pelos dados coletados) com >= 100 contactos
  const { count } = await supabase
    .from('contactos')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', req.user.id);

  const publico = (count || 0) >= 100
    ? await construirPublicoSegmentado(req.user.id)
    : { geo_locations: { countries: ['MZ'] }, age_min: 18, age_max: 55 };

  try {
    const resultado = await criarCampanhaCompleta({
      adAccountId: conta.ad_account_id,
      accessToken: conta.access_token,
      pageId: conta.page_id,
      pixelId: conta.pixel_id,
      config: {
        nomeProduto: produto.nome_produto,
        sobreProduto: produto.sobre_produto,
        orcamentoDiario,
        linkDestino,
        imagemUrl,
        publico,
      },
    });

    const { data: campanha, error } = await supabase
      .from('campanhas')
      .insert({
        user_id: req.user.id,
        conta_anuncio_id: contaAnuncioId,
        produto_id: produtoId,
        nome: produto.nome_produto,
        objetivo: 'OUTCOME_ENGAGEMENT',
        orcamento_diario: orcamentoDiario,
        publico_tipo: (count || 0) >= 100 ? 'personalizado' : 'generico',
        estado: 'pausada',
        meta_campaign_id: resultado.campaignId,
        meta_adset_id: resultado.adsetId,
        meta_creative_id: resultado.creativeId,
        meta_ad_id: resultado.adId,
      })
      .select()
      .single();

    if (error) return res.status(400).json({ erro: error.message });
    res.json(campanha);
  } catch (err) {
    res.status(400).json({ erro: err.response?.data?.error?.message || err.message });
  }
});

router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('campanhas')
    .select('*')
    .eq('user_id', req.user.id)
    .order('criado_em', { ascending: false });

  if (error) return res.status(400).json({ erro: error.message });
  res.json(data);
});

async function construirPublicoSegmentado(userId) {
  const { data: compradores } = await supabase
    .from('contactos')
    .select('idade, dor_nicho')
    .eq('user_id', userId)
    .eq('estado', 'comprou');

  const idades = (compradores || []).map((c) => c.idade).filter(Boolean);
  const idadeMin = idades.length ? Math.max(18, Math.min(...idades) - 5) : 18;
  const idadeMax = idades.length ? Math.min(65, Math.max(...idades) + 5) : 55;

  return {
    geo_locations: { countries: ['MZ'] },
    age_min: idadeMin,
    age_max: idadeMax,
  };
}

export default router;
