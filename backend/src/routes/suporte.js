import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';

const router = express.Router();
router.use(requireAuth);

const pedeHumano = (texto) =>
  /não (resolve|ajuda)|nao (resolve|ajuda)|insatisfeit|humano|atendente|pessoa|suporte humano/i.test(texto);

router.get('/tickets', async (req, res) => {
  const { data, error } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('user_id', req.user.id)
    .order('criado_em', { ascending: false });

  if (error) return res.status(500).json({ erro: error.message });
  res.json(data || []);
});

router.post('/tickets', async (req, res) => {
  const assunto = String(req.body?.assunto || 'Pedido de suporte');
  const problema = String(req.body?.problema || '');
  const categoria = String(req.body?.categoria || 'other');

  const humano = pedeHumano(problema);

  const { data, error } = await supabase
    .from('support_tickets')
    .insert({
      user_id: req.user.id,
      assunto,
      estado: humano ? 'em atendimento' : 'aberto',
      prioridade: humano ? 'alta' : 'normal',
      origem: 'chatbot',
      humano_solicitado: humano,
      insatisfacao_detectada: humano,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ erro: error.message });

  await supabase.from('support_messages').insert({
    ticket_id: data.id,
    remetente_tipo: 'utilizador',
    remetente_id: req.user.id,
    conteudo: `[${categoria}] ${problema}`,
  });

  res.json({
    ticket: data,
    transferido: humano,
    mensagem: humano
      ? 'Entendido. Vou transferir este pedido para a nossa equipa de suporte.'
      : 'Recebi o teu pedido. A equipa de suporte poderá continuar a conversa se necessário.',
  });
});

router.get('/tickets/:id/mensagens', async (req, res) => {
  const { data: ticket } = await supabase
    .from('support_tickets')
    .select('id')
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .maybeSingle();

  if (!ticket) return res.status(404).json({ erro: 'Ticket não encontrado.' });

  const { data, error } = await supabase
    .from('support_messages')
    .select('*')
    .eq('ticket_id', ticket.id)
    .order('id', { ascending: true });

  if (error) return res.status(500).json({ erro: error.message });
  res.json(data || []);
});

export default router;
