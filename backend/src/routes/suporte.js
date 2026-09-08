import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';

const router = express.Router();
router.use(requireAuth);

const CONTACTOS_SUPORTE = {
  email: 'contact@blui.online',
  whatsapp: '+27722958915',
  instagram: ['velionconsolidate', 'dalton_fds'],
};

const FRASES_INSATISFACAO = [
  'não resolveu', 'nao resolveu', 'não ajudou', 'nao ajudou', 'insatisfeito',
  'quero falar com humano', 'quero um humano', 'atendente humano', 'pessoa real',
  'isto não serve', 'não é isso', 'nao e isso', 'péssimo', 'pessimo',
];

const REGRAS_RESPOSTA = [
  { chaves: ['preço', 'preco', 'quanto custa', 'plano', 'planos', 'valor'],
    resposta: 'Temos planos a partir de R$5 (Teste, 7 dias) até R$72 (Pro, 30 dias, acesso total). Podes ver e escolher em "Assinatura" no menu.' },
  { chaves: ['whatsapp', 'conectar whatsapp', 'ligar whatsapp'],
    resposta: 'Para ligar o WhatsApp, vai a Definições → Canais e segue os passos de ligação. Se já tentaste e não funcionou, diz-me "quero falar com humano" que encaminho ao suporte.' },
  { chaves: ['cancelar', 'cancelar plano', 'cancelar assinatura'],
    resposta: 'Para cancelar a tua assinatura, contacta o suporte diretamente — ainda não há cancelamento automático nesta versão.' },
  { chaves: ['contacto', 'campanha', 'anúncio', 'anuncio', 'facebook', 'instagram ads'],
    resposta: 'As campanhas criam-se em "Campanhas", ligando primeiro a tua conta de anúncios em Definições. Precisas de ter pelo menos 1 produto configurado.' },
  { chaves: ['numero', 'número', 'importar numeros', 'importar números'],
    resposta: 'Podes adicionar números manualmente ou por imagem em "Números" no menu — depois usas essas listas para segmentar campanhas (incluir/excluir).' },
];

function gerarRespostaBot(mensagemUtilizador) {
  const texto = mensagemUtilizador.toLowerCase();

  for (const regra of REGRAS_RESPOSTA) {
    if (regra.chaves.some((chave) => texto.includes(chave))) {
      return { resposta: regra.resposta, resolvido: true };
    }
  }

  return {
    resposta: 'Não tenho a certeza de como ajudar com isso. Queres que eu encaminhe para um atendente humano?',
    resolvido: false,
  };
}

function detectarInsatisfacao(texto) {
  const t = texto.toLowerCase();
  return FRASES_INSATISFACAO.some((frase) => t.includes(frase));
}

router.get('/contactos', (_req, res) => res.json(CONTACTOS_SUPORTE));

router.get('/meus-tickets', async (req, res) => {
  const { data, error } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('user_id', req.user.id)
    .order('criado_em', { ascending: false });

  if (error) return res.status(500).json({ erro: error.message });
  res.json(data || []);
});

router.get('/ticket/:id', async (req, res) => {
  const { data: ticket, error: erroTicket } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .single();

  if (erroTicket || !ticket) return res.status(404).json({ erro: 'Ticket não encontrado.' });

  const { data: mensagens, error: erroMensagens } = await supabase
    .from('support_messages')
    .select('*')
    .eq('ticket_id', ticket.id)
    .order('criado_em', { ascending: true });

  if (erroMensagens) return res.status(500).json({ erro: erroMensagens.message });
  res.json({ ticket, mensagens: mensagens || [] });
});

// Inicia uma conversa nova com o chatbot
router.post('/ticket', async (req, res) => {
  const { assunto, mensagem } = req.body;
  if (!mensagem || !mensagem.trim()) return res.status(400).json({ erro: 'Escreve uma mensagem.' });

  const { data: ticket, error: erroTicket } = await supabase
    .from('support_tickets')
    .insert({
      user_id: req.user.id,
      assunto: assunto || mensagem.slice(0, 60),
      estado: 'aberto',
      origem: 'chatbot',
      humano_solicitado: false,
      insatisfacao_detectada: false,
    })
    .select()
    .single();

  if (erroTicket) return res.status(500).json({ erro: erroTicket.message });

  await supabase.from('support_messages').insert({
    ticket_id: ticket.id,
    remetente_tipo: 'user',
    remetente_id: req.user.id,
    conteudo: mensagem,
  });

  const { resposta, resolvido } = gerarRespostaBot(mensagem);

  await supabase.from('support_messages').insert({
    ticket_id: ticket.id,
    remetente_tipo: 'bot',
    conteudo: resposta,
  });

  res.status(201).json({ ticket, respostaBot: resposta, resolvido, contactosSuporte: CONTACTOS_SUPORTE });
});

// Continua a conversa - deteta insatisfação e pedidos de humano automaticamente
router.post('/ticket/:id/mensagem', async (req, res) => {
  const { mensagem, pedirHumano } = req.body;
  if (!mensagem || !mensagem.trim()) return res.status(400).json({ erro: 'Escreve uma mensagem.' });

  const { data: ticket, error: erroTicket } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .single();

  if (erroTicket || !ticket) return res.status(404).json({ erro: 'Ticket não encontrado.' });

  await supabase.from('support_messages').insert({
    ticket_id: ticket.id,
    remetente_tipo: 'user',
    remetente_id: req.user.id,
    conteudo: mensagem,
  });

  const insatisfeito = pedirHumano === true || detectarInsatisfacao(mensagem);

  let respostaBot = null;
  if (insatisfeito) {
    respostaBot = `Entendido — vou encaminhar-te para um atendente humano. Podes também contactar diretamente: email ${CONTACTOS_SUPORTE.email} ou WhatsApp ${CONTACTOS_SUPORTE.whatsapp}.`;

    await supabase
      .from('support_tickets')
      .update({ humano_solicitado: true, insatisfacao_detectada: true, atualizado_em: new Date().toISOString() })
      .eq('id', ticket.id);
  } else {
    const resultado = gerarRespostaBot(mensagem);
    respostaBot = resultado.resposta;
  }

  await supabase.from('support_messages').insert({
    ticket_id: ticket.id,
    remetente_tipo: 'bot',
    conteudo: respostaBot,
  });

  res.json({ respostaBot, encaminhadoParaHumano: insatisfeito, contactosSuporte: insatisfeito ? CONTACTOS_SUPORTE : undefined });
});

router.post('/ticket/:id/pedir-humano', async (req, res) => {
  const { data, error } = await supabase
    .from('support_tickets')
    .update({ humano_solicitado: true, atualizado_em: new Date().toISOString() })
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .select()
    .single();

  if (error) return res.status(500).json({ erro: error.message });
  res.json({ ticket: data, contactosSuporte: CONTACTOS_SUPORTE });
});

export default router;
