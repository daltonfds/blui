import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';
import { aiJson } from '../services/ai.js';

const router = Router();
router.use(requireAuth);

router.get('/treino', async (req, res) => {
  const { data, error } = await supabase
    .from('agent_settings')
    .select('instrucoes,negociacao_ativa,desconto_maximo,frete_gratis')
    .eq('user_id', req.user.id)
    .maybeSingle();

  if (error) return res.status(500).json({ erro: error.message });

  res.json({
    instrucoes: data?.instrucoes || '',
    negociacao: {
      ativa: data?.negociacao_ativa || false,
      desconto_maximo: Number(data?.desconto_maximo || 0),
      frete_gratis: data?.frete_gratis || false,
    },
  });
});

router.put('/treino', async (req, res) => {
  const instrucoes = String(req.body?.instrucoes || '');
  const negociacao = req.body?.negociacao || {};

  const payload = {
    user_id: req.user.id,
    instrucoes,
    negociacao_ativa: Boolean(negociacao.ativa),
    desconto_maximo: Math.max(0, Math.min(100, Number(negociacao.desconto_maximo || 0))),
    frete_gratis: Boolean(negociacao.frete_gratis),
    atualizado_em: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('agent_settings')
    .upsert(payload, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) return res.status(500).json({ erro: error.message });
  res.json({ ok: true, treino: data });
});

router.post('/melhorar-copy', async (req, res) => {
  const { texto = '', nicho = '', produto = '' } = req.body;
  if (!texto.trim()) return res.status(400).json({ erro: 'texto é obrigatório.' });

  const result = await aiJson({
    system: 'Melhora copy de vendas mantendo a verdade da oferta. Retorna JSON com headline, corpo, beneficios e cta.',
    user: JSON.stringify({ texto, nicho, produto }),
  }) || {
    headline: texto.slice(0, 120),
    corpo: texto,
    beneficios: [],
    cta: 'Saber mais',
  };

  await supabase.from('ai_analyses').insert({
    user_id: req.user.id,
    tipo: 'copy',
    entrada: { texto, nicho, produto },
    resultado: result,
  });

  res.json(result);
});

export default router;
