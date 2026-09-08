import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';

const router = express.Router();
router.use(requireAuth);

async function requireAdmin(req, res, next) {
  const { data } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', req.user.id)
    .eq('ativo', true)
    .maybeSingle();

  if (!data) return res.status(403).json({ erro: 'Acesso restrito ao administrador.' });
  next();
}

router.use(requireAdmin);

router.get('/resumo', async (_req, res) => {
  const [{ count: totalUtilizadores }, { data: assinaturasAtivas }, { data: receitaData }] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('assinaturas').select('id').eq('estado', 'ativa'),
    supabase.from('assinaturas').select('planos(preco_brl)').eq('estado', 'ativa'),
  ]);

  const receitaMensal = (receitaData || []).reduce((soma, a) => soma + Number(a.planos?.preco_brl || 0), 0);

  res.json({
    totalUtilizadores: totalUtilizadores || 0,
    assinaturasAtivas: (assinaturasAtivas || []).length,
    receitaMensalBrl: receitaMensal,
  });
});

router.get('/utilizadores', async (_req, res) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, nome, telefone, localizacao, is_admin, assinaturas(estado, ciclo_fim, mensagens_usadas, planos(nome, preco_brl))')
    .order('id');

  if (error) return res.status(500).json({ erro: error.message });
  res.json(data || []);
});

router.get('/assinaturas-pendentes', async (_req, res) => {
  const { data, error } = await supabase
    .from('assinaturas')
    .select('*, planos(nome, preco_brl), profiles:user_id(nome, telefone)')
    .eq('estado', 'pendente')
    .order('criado_em', { ascending: true });

  if (error) return res.status(500).json({ erro: error.message });
  res.json(data || []);
});

router.post('/assinaturas/:id/aprovar', async (req, res) => {
  const { data: pedido, error: erroPedido } = await supabase
    .from('assinaturas')
    .select('id, plano_id, planos(nome, dias_validade)')
    .eq('id', req.params.id)
    .single();

  if (erroPedido || !pedido) {
    return res.status(404).json({ erro: 'Assinatura não encontrada.' });
  }

  const dias = Number(pedido.planos?.dias_validade || 30);
  const inicio = new Date();
  const fim = new Date(inicio);
  fim.setDate(fim.getDate() + dias);

  const { data, error } = await supabase
    .from('assinaturas')
    .update({
      estado: 'ativa',
      ciclo_inicio: inicio.toISOString(),
      ciclo_fim: fim.toISOString(),
      mensagens_usadas: 0,
      atualizado_em: new Date().toISOString(),
    })
    .eq('id', req.params.id)
    .select('*, planos(*)')
    .single();

  if (error) return res.status(500).json({ erro: error.message });
  res.json(data);
});

router.post('/assinaturas/:id/rejeitar', async (req, res) => {
  const { data, error } = await supabase
    .from('assinaturas')
    .update({ estado: 'cancelada', atualizado_em: new Date().toISOString() })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ erro: error.message });
  res.json(data);
});

router.get('/tickets', async (_req, res) => {
  const { data, error } = await supabase
    .from('support_tickets')
    .select('*, profiles:user_id(nome, telefone)')
    .order('humano_solicitado', { ascending: false })
    .order('criado_em', { ascending: false });

  if (error) return res.status(500).json({ erro: error.message });
  res.json(data || []);
});

export default router;
