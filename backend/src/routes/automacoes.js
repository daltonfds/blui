import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';

const router = express.Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('automacoes')
    .select('*')
    .eq('user_id', req.user.id)
    .order('criado_em', { ascending: false });

  if (error) return res.status(500).json({ erro: error.message });
  res.json(data || []);
});

router.post('/', async (req, res) => {
  const { nome, tipo, configuracao = {} } = req.body || {};

  if (!nome || !tipo) {
    return res.status(400).json({ erro: 'Nome e tipo são obrigatórios.' });
  }

  const { data, error } = await supabase
    .from('automacoes')
    .insert({
      user_id: req.user.id,
      nome,
      tipo,
      configuracao,
      ativo: true,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ erro: error.message });
  res.json(data);
});

router.patch('/:id', async (req, res) => {
  const updates = {};
  if (typeof req.body?.ativo === 'boolean') updates.ativo = req.body.ativo;
  if (req.body?.nome) updates.nome = req.body.nome;
  if (req.body?.configuracao) updates.configuracao = req.body.configuracao;

  const { data, error } = await supabase
    .from('automacoes')
    .update(updates)
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .select()
    .single();

  if (error) return res.status(500).json({ erro: error.message });
  res.json(data);
});

export default router;
