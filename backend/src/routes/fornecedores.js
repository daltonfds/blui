import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';

const router = Router();
router.use(requireAuth);

function rankSupplier(item) {
  const rating = Number(item.rating || 0);
  const reviews = Number(item.reviews || 0);
  const shipping = Number(item.shipping_days || 99);
  return Math.max(0, Math.min(5, rating * 0.75 + Math.min(reviews / 1000, 1) * 0.75 + (shipping <= 7 ? 0.75 : shipping <= 15 ? 0.4 : 0)));
}

router.post('/pesquisar', async (req, res) => {
  const pais = String(req.body?.pais || '').trim();
  const palavraChave = String(req.body?.palavra_chave || '').trim();
  if (!pais || !palavraChave) return res.status(400).json({ erro: 'pais e palavra_chave são obrigatórios.' });

  let resultados = [];
  if (process.env.SUPPLIER_SEARCH_URL) {
    try {
      const url = new URL(process.env.SUPPLIER_SEARCH_URL);
      url.searchParams.set('country', pais);
      url.searchParams.set('q', palavraChave);
      const r = await fetch(url, { headers: { Authorization: `Bearer ${process.env.SUPPLIER_SEARCH_TOKEN || ''}` } });
      if (r.ok) resultados = await r.json();
    } catch {}
  }

  resultados = (Array.isArray(resultados) ? resultados : []).map(x => ({
    ...x,
    estrelas: Number(x.estrelas || rankSupplier(x)),
  })).sort((a, b) => b.estrelas - a.estrelas);

  const { data, error } = await supabase.from('supplier_searches').insert({
    user_id: req.user.id,
    pais,
    palavra_chave: palavraChave,
    resultados,
  }).select().single();

  if (error) return res.status(500).json({ erro: error.message });
  res.json(data);
});

router.get('/historico', async (req, res) => {
  const { data, error } = await supabase.from('supplier_searches')
    .select('*').eq('user_id', req.user.id).order('criado_em', { ascending: false }).limit(50);
  if (error) return res.status(500).json({ erro: error.message });
  res.json(data || []);
});

export default router;
