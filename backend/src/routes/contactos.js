import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// Lista todos os contactos do utilizador, com filtro opcional por estado
router.get('/', async (req, res) => {
  const { estado } = req.query;
  let query = supabase
    .from('contactos')
    .select('*')
    .eq('user_id', req.user.id)
    .order('ultima_interacao', { ascending: false });

  if (estado) query = query.eq('estado', estado);

  const { data, error } = await query;
  if (error) return res.status(400).json({ erro: error.message });
  res.json(data);
});

// Resumo por estado (para os cartões do painel)
router.get('/resumo', async (req, res) => {
  const { data, error } = await supabase
    .from('contactos')
    .select('estado')
    .eq('user_id', req.user.id);

  if (error) return res.status(400).json({ erro: error.message });

  const resumo = { novo: 0, conversando: 0, pendente: 0, comprou: 0, nao_respondeu: 0, follow_up: 0 };
  data.forEach((c) => { resumo[c.estado] = (resumo[c.estado] || 0) + 1; });
  res.json({ total: data.length, resumo });
});

// Cria ou atualiza um contacto manualmente
router.post('/', async (req, res) => {
  const payload = { ...req.body, user_id: req.user.id };
  const { data, error } = await supabase
    .from('contactos')
    .upsert(payload, { onConflict: 'user_id,numero' })
    .select()
    .single();

  if (error) return res.status(400).json({ erro: error.message });
  res.json(data);
});

// Atualiza estado de um contacto (ex: marcar como "comprou")
router.patch('/:id/estado', async (req, res) => {
  const { estado } = req.body;
  const { data, error } = await supabase
    .from('contactos')
    .update({ estado, ultima_interacao: new Date().toISOString() })
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .select()
    .single();

  if (error) return res.status(400).json({ erro: error.message });
  res.json(data);
});

// Histórico de mensagens de um contacto (memória da conversa)
router.get('/:id/mensagens', async (req, res) => {
  const { data, error } = await supabase
    .from('mensagens')
    .select('*')
    .eq('contacto_id', req.params.id)
    .order('criado_em', { ascending: true });

  if (error) return res.status(400).json({ erro: error.message });
  res.json(data);
});

// Exportação simples em CSV (para "copiar e segmentar anúncios")
router.get('/exportar/csv', async (req, res) => {
  const { estado } = req.query;
  let query = supabase.from('contactos').select('*').eq('user_id', req.user.id);
  if (estado) query = query.eq('estado', estado);

  const { data, error } = await query;
  if (error) return res.status(400).json({ erro: error.message });

  const cabecalho = 'numero,nome,email,idade,dor_nicho,estado,valor_comprado,utm_origem\n';
  const linhas = data
    .map((c) => [c.numero, c.nome, c.email, c.idade, c.dor_nicho, c.estado, c.valor_comprado, c.utm_origem]
      .map((v) => `"${(v ?? '').toString().replace(/"/g, '""')}"`)
      .join(','))
    .join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="contactos.csv"');
  res.send(cabecalho + linhas);
});

export default router;
