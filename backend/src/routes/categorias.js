import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';

const router = express.Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('categorias_produtos')
    .select('*')
    .eq('user_id', req.user.id)
    .order('nome');

  if (error) return res.status(500).json({ erro: error.message });
  res.json(data || []);
});

router.post('/', async (req, res) => {
  const nome = String(req.body?.nome || '').trim();

  if (!nome) {
    return res.status(400).json({ erro: 'O nome da categoria é obrigatório.' });
  }

  const { data, error } = await supabase
    .from('categorias_produtos')
    .insert({ user_id: req.user.id, nome })
    .select()
    .single();

  if (error) return res.status(400).json({ erro: error.message });
  res.status(201).json(data);
});

router.delete('/:id', async (req, res) => {
  const { error } = await supabase
    .from('categorias_produtos')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', req.user.id);

  if (error) return res.status(400).json({ erro: error.message });
  res.status(204).send();
});

export default router;
