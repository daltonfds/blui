import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const limit = Math.min(Number(req.query.limit || 50), 200);
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', req.user.id)
    .order('criado_em', { ascending: false })
    .limit(limit);

  if (error) return res.status(500).json({ erro: error.message });
  res.json(data || []);
});

router.get('/nao-lidas', async (req, res) => {
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', req.user.id)
    .eq('lida', false);

  if (error) return res.status(500).json({ erro: error.message });
  res.json({ total: count || 0 });
});

router.patch('/:id/lida', async (req, res) => {
  const { data, error } = await supabase
    .from('notifications')
    .update({ lida: true })
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .select()
    .single();

  if (error) return res.status(500).json({ erro: error.message });
  res.json(data);
});

router.post('/marcar-todas', async (req, res) => {
  const { error } = await supabase
    .from('notifications')
    .update({ lida: true })
    .eq('user_id', req.user.id)
    .eq('lida', false);

  if (error) return res.status(500).json({ erro: error.message });
  res.json({ ok: true });
});

export default router;
