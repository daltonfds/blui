import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';

const router = express.Router();
router.use(requireAuth);

router.get('/resumo', async (req, res) => {
  const uid = req.user.id;

  const [
    contactos,
    compradores,
    eventos,
    pedidos,
  ] = await Promise.all([
    supabase.from('contactos').select('id,estado,valor_comprado,criado_em', { count: 'exact' }).eq('user_id', uid),
    supabase.from('contactos').select('id,valor_comprado').eq('user_id', uid).eq('estado', 'comprou'),
    supabase.from('analytics_events').select('id,tipo,criado_em').eq('user_id', uid),
    supabase.from('orders').select('id,total,estado').eq('user_id', uid),
  ]);

  if (contactos.error) return res.status(500).json({ erro: contactos.error.message });

  const lista = contactos.data || [];
  const compras = compradores.data || [];
  const ev = eventos.data || [];
  const orders = pedidos.data || [];

  const receitaContactos = compras.reduce((s, x) => s + Number(x.valor_comprado || 0), 0);
  const receitaPedidos = orders
    .filter(x => ['pago', 'paid', 'concluido', 'completed'].includes(String(x.estado).toLowerCase()))
    .reduce((s, x) => s + Number(x.total || 0), 0);

  const porEstado = lista.reduce((acc, x) => {
    const estado = x.estado || 'novo';
    acc[estado] = (acc[estado] || 0) + 1;
    return acc;
  }, {});

  const porEvento = ev.reduce((acc, x) => {
    acc[x.tipo] = (acc[x.tipo] || 0) + 1;
    return acc;
  }, {});

  res.json({
    contactos: lista.length,
    leads: lista.filter(x => !['comprou', 'cliente'].includes(x.estado)).length,
    clientes: compras.length,
    receita: receitaPedidos || receitaContactos,
    eventos: ev.length,
    porEstado,
    porEvento,
  });
});

export default router;
