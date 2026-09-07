import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';

const router = express.Router();
router.use(requireAuth);

router.get('/produtos', async (req, res) => {
  const { data, error } = await supabase
    .from('produtos')
    .select('*')
    .eq('user_id', req.user.id)
    .order('nome_produto');

  if (error) return res.status(500).json({ erro: error.message });
  res.json(data || []);
});

router.get('/pedidos', async (req, res) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*,order_items(*)')
    .eq('user_id', req.user.id)
    .order('criado_em', { ascending: false });

  if (error) return res.status(500).json({ erro: error.message });
  res.json(data || []);
});

router.get('/carrinhos', async (req, res) => {
  const { data, error } = await supabase
    .from('carts')
    .select('*,cart_items(*)')
    .eq('user_id', req.user.id)
    .order('atualizado_em', { ascending: false });

  if (error) return res.status(500).json({ erro: error.message });
  res.json(data || []);
});

router.post('/carrinhos', async (req, res) => {
  const { contacto_id = null } = req.body || {};

  const { data, error } = await supabase
    .from('carts')
    .insert({
      user_id: req.user.id,
      contacto_id,
      estado: 'aberto',
      total: 0,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ erro: error.message });
  res.json(data);
});

export default router;
