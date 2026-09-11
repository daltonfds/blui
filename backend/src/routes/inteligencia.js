import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { aiJson, heuristicLeadScore, detectObjection, detectSentiment } from '../services/ai.js';
import { createNotification } from '../services/notifications.js';

const router = Router();
router.use(requireAuth);

router.get('/score/:contactoId', async (req, res) => {
  const { data: contact, error: ce } = await supabase
    .from('contactos')
    .select('*')
    .eq('id', req.params.contactoId)
    .eq('user_id', req.user.id)
    .maybeSingle();

  if (ce) return res.status(500).json({ erro: ce.message });
  if (!contact) return res.status(404).json({ erro: 'Contacto não encontrado.' });

  const { data: messages } = await supabase
    .from('mensagens')
    .select('conteudo,remetente,criado_em')
    .eq('contacto_id', contact.id)
    .order('criado_em', { ascending: true })
    .limit(100);

  const score = heuristicLeadScore(messages || []);
  const lastInbound = [...(messages || [])].reverse().find(m => m.remetente !== 'agente');
  const objection = detectObjection(lastInbound?.conteudo || '');
  const sentiment = detectSentiment(lastInbound?.conteudo || '');

  await supabase.from('contactos').update({
    lead_score: score,
    objeccao: objection,
    sentimento: sentiment,
  }).eq('id', contact.id).eq('user_id', req.user.id);

  await supabase.from('lead_scores').insert({
    user_id: req.user.id,
    contacto_id: contact.id,
    score,
    intencao: score >= 75 ? 'alta' : score >= 45 ? 'media' : 'baixa',
    sinais: { objection, sentiment },
  });

  res.json({ contacto_id: contact.id, score, intencao: score >= 75 ? 'alta' : score >= 45 ? 'media' : 'baixa', objection, sentiment });
});

router.post('/analisar-conversa/:contactoId', async (req, res) => {
  const { data: contact } = await supabase
    .from('contactos')
    .select('*')
    .eq('id', req.params.contactoId)
    .eq('user_id', req.user.id)
    .maybeSingle();

  if (!contact) return res.status(404).json({ erro: 'Contacto não encontrado.' });

  const { data: messages } = await supabase
    .from('mensagens')
    .select('remetente,conteudo,canal,criado_em')
    .eq('contacto_id', contact.id)
    .order('criado_em', { ascending: true })
    .limit(200);

  const fallback = {
    resumo: `Conversa com ${contact.nome || contact.numero}.`,
    produto: contact.produto_id || null,
    intencao: 'avaliar',
    objecoes: [],
    proximos_passos: ['Fazer follow-up contextual.'],
    sentimento: 'neutro',
    score: heuristicLeadScore(messages || []),
  };

  const result = await aiJson({
    system: 'Analisa conversas comerciais. Responde apenas JSON com resumo, produto, intencao, objecoes, proximos_passos, sentimento e score.',
    user: JSON.stringify({ contacto: contact, mensagens: messages || [] }),
  }) || fallback;

  await supabase.from('ai_analyses').insert({
    user_id: req.user.id,
    contacto_id: contact.id,
    tipo: 'conversa',
    entrada: { mensagens: messages || [] },
    resultado: result,
  });

  res.json(result);
});

router.post('/script', async (req, res) => {
  const { nicho = '', produto = '', mensagens = [] } = req.body;
  const fallback = {
    abertura: `Olá! Vi que tens interesse em ${produto || 'este produto'}. Posso explicar como funciona e como fazemos a entrega?`,
    follow_up: `Queria só saber se ficou alguma dúvida sobre ${produto || 'o produto'}.`,
    quebra_objecao: 'Posso explicar preço, entrega, pagamento e garantia de forma simples.',
  };

  const result = await aiJson({
    system: 'Cria scripts de atendimento e vendas em português. Retorna JSON com abertura, follow_up e quebra_objecao.',
    user: JSON.stringify({ nicho, produto, mensagens }),
  }) || fallback;

  res.json(result);
});

router.post('/produto-detectar', async (req, res) => {
  const text = String(req.body?.texto || '').trim();
  const { data: products } = await supabase
    .from('produtos')
    .select('id,nome_produto,sobre_produto')
    .eq('user_id', req.user.id)
    .eq('ativo', true);

  const normalized = text.toLowerCase();
  const match = (products || []).find(p =>
    normalized.includes(String(p.nome_produto || '').toLowerCase())
  );

  res.json({
    produto: match || null,
    confianca: match ? 0.95 : 0,
  });
});

router.post('/notificar-crise/:contactoId', async (req, res) => {
  const { data: contact } = await supabase.from('contactos')
    .select('id,nome,numero')
    .eq('id', req.params.contactoId)
    .eq('user_id', req.user.id)
    .maybeSingle();

  if (!contact) return res.status(404).json({ erro: 'Contacto não encontrado.' });

  const notification = await createNotification(
    req.user.id,
    'human_handoff',
    'Atendimento humano necessário',
    `A conversa de ${contact.nome || contact.numero} foi sinalizada para intervenção.`,
    { contacto_id: contact.id, prioridade: 'alta' }
  );

  res.json({ ok: true, notification });
});

export default router;
