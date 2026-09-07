import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';

const router = express.Router();
router.use(requireAuth);

router.get('/planos', async (_req, res) => {
  const { data, error } = await supabase
    .from('planos')
    .select('id,nome,preco_brl,mensagens_incluidas,preco_excedente_brl,descricao,funcionalidades,ordem')
    .eq('ativo', true)
    .order('ordem');

  if (error) return res.status(500).json({ erro: error.message });
  res.json(data || []);
});

router.get('/minha', async (req, res) => {
  const { data, error } = await supabase
    .from('assinaturas')
    .select('*,planos(*)')
    .eq('user_id', req.user.id)
    .order('criado_em', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return res.status(500).json({ erro: error.message });
  res.json(data || null);
});

export default router;
