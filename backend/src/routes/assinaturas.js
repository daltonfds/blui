import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';

const router = express.Router();
router.use(requireAuth);

router.get('/planos', async (_req, res) => {
  const { data, error } = await supabase
    .from('planos')
    .select('id,nome,preco_brl,mensagens_incluidas,preco_excedente_brl,descricao,funcionalidades,ordem,dias_validade')
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
    .in('estado', ['ativa', 'pendente'])
    .order('criado_em', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return res.status(500).json({ erro: error.message });
  res.json(data || null);
});

// Pede um plano (fica pendente até o admin aprovar - ainda não há pagamento automático ligado)
router.post('/escolher', async (req, res) => {
  const { planoId } = req.body;
  if (!planoId) return res.status(400).json({ erro: 'planoId é obrigatório.' });

  const { data: plano, error: erroPlano } = await supabase
    .from('planos')
    .select('*')
    .eq('id', planoId)
    .eq('ativo', true)
    .single();

  if (erroPlano || !plano) return res.status(404).json({ erro: 'Plano não encontrado.' });

  const { data, error } = await supabase
    .from('assinaturas')
    .insert({ user_id: req.user.id, plano_id: planoId, estado: 'pendente' })
    .select('*, planos(*)')
    .single();

  if (error) return res.status(500).json({ erro: error.message });
  res.status(201).json(data);
});

export default router;
