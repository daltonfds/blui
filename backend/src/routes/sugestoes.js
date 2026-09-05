import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

const MINIMO_CONTACTOS = 100;

router.get('/', async (req, res) => {
  const { count } = await supabase
    .from('contactos')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', req.user.id);

  if ((count || 0) < MINIMO_CONTACTOS) {
    return res.json({
      liberado: false,
      contactos_atual: count || 0,
      contactos_necessarios: MINIMO_CONTACTOS,
      mensagem: `Reúne pelo menos ${MINIMO_CONTACTOS} contactos para receberes sugestões fiáveis. Faltam ${MINIMO_CONTACTOS - (count || 0)}.`,
    });
  }

  const { data, error } = await supabase
    .from('sugestoes')
    .select('*')
    .eq('user_id', req.user.id)
    .order('criado_em', { ascending: false });

  if (error) return res.status(400).json({ erro: error.message });
  res.json({ liberado: true, sugestoes: data });
}
);

export default router;
