import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';
import { aiJson } from '../services/ai.js';

const router = Router();
router.use(requireAuth);

router.post('/melhorar-copy', async (req, res) => {
  const { texto = '', nicho = '', produto = '' } = req.body;
  if (!texto.trim()) return res.status(400).json({ erro: 'texto é obrigatório.' });

  const result = await aiJson({
    system: 'Melhora copy de vendas mantendo a verdade da oferta. Retorna JSON com headline, corpo, beneficios, prova, cta e testes_ab.',
    user: JSON.stringify({ texto, nicho, produto }),
  }) || {
    headline: texto.slice(0, 120),
    corpo: texto,
    beneficios: [],
    prova: [],
    cta: 'Saber mais',
    testes_ab: [],
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
