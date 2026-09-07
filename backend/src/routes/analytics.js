import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';

const router = express.Router();
router.use(requireAuth);

router.get('/resumo', async (req, res) => {
  const uid = req.user.id;

  const [
    contactos,
    eventos,
    pedidos,
    campanhas,
    uso,
  ] = await Promise.all([
    supabase
      .from('contactos')
      .select('id,estado,valor_comprado,criado_em,ultima_interacao')
      .eq('user_id', uid),

    supabase
      .from('analytics_events')
      .select('id,tipo,session_id,criado_em')
      .eq('user_id', uid),

    supabase
      .from('orders')
      .select('id,total,estado,criado_em')
      .eq('user_id', uid),

    supabase
      .from('campanhas')
      .select('id,estado,orcamento_diario,criado_em')
      .eq('user_id', uid),

    supabase
      .from('usage_events')
      .select('id,custo_brl,cobravel,criado_em')
      .eq('user_id', uid),
  ]);

  if (contactos.error) return res.status(500).json({ erro: contactos.error.message });
  if (eventos.error) return res.status(500).json({ erro: eventos.error.message });
  if (pedidos.error) return res.status(500).json({ erro: pedidos.error.message });

  const lista = contactos.data || [];
  const ev = eventos.data || [];
  const orders = pedidos.data || [];
  const camps = campanhas.data || [];
  const usage = uso.data || [];

  const clientes = lista.filter(
    x => ['comprou', 'cliente'].includes(String(x.estado).toLowerCase())
  );

  const leads = lista.filter(
    x => !['comprou', 'cliente'].includes(String(x.estado).toLowerCase())
  );

  const receitaContactos = clientes.reduce(
    (sum, x) => sum + Number(x.valor_comprado || 0),
    0
  );

  const receitaPedidos = orders
    .filter(x =>
      ['pago', 'paid', 'concluido', 'completed', 'entregue'].includes(
        String(x.estado).toLowerCase()
      )
    )
    .reduce((sum, x) => sum + Number(x.total || 0), 0);

  const receita = receitaPedidos || receitaContactos;

  const sessoes = new Set(
    ev.filter(x => x.session_id).map(x => x.session_id)
  );

  const compras = ev.filter(x =>
    ['Purchase', 'purchase', 'compra'].includes(String(x.tipo))
  ).length;

  const custo = usage.reduce(
    (sum, x) => sum + Number(x.custo_brl || 0),
    0
  );

  const porEstado = lista.reduce((acc, x) => {
    const estado = x.estado || 'novo';
    acc[estado] = (acc[estado] || 0) + 1;
    return acc;
  }, {});

  const porEvento = ev.reduce((acc, x) => {
    acc[x.tipo] = (acc[x.tipo] || 0) + 1;
    return acc;
  }, {});

  const roas = custo > 0 ? receita / custo : 0;
  const roi = custo > 0 ? ((receita - custo) / custo) * 100 : 0;

  res.json({
    contactos: lista.length,
    leads: leads.length,
    clientes: clientes.length,
    receita,
    eventos: ev.length,
    visitantes: sessoes.size,
    conversas: porEvento.mensagem || porEvento.conversa || 0,
    vendas: compras || orders.length,
    pedidos: orders.length,
    campanhas: camps.length,
    custo,
    roas,
    roi,
    porEstado,
    porEvento,
  });
});

router.get('/eventos', async (req, res) => {
  const { tipo, limite = 100 } = req.query;

  let query = supabase
    .from('analytics_events')
    .select('*')
    .eq('user_id', req.user.id)
    .order('criado_em', { ascending: false })
    .limit(Math.min(Number(limite) || 100, 500));

  if (tipo) query = query.eq('tipo', tipo);

  const { data, error } = await query;

  if (error) return res.status(500).json({ erro: error.message });
  res.json(data || []);
});

export default router;
