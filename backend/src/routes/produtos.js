import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

const normalizar = (body = {}) => ({
  nome_produto: String(body.nome_produto ?? '').trim(),
  sobre_produto: String(body.sobre_produto ?? '').trim() || null,
  preco: body.preco === '' || body.preco === undefined || body.preco === null
    ? null
    : Number(body.preco),
  custo: body.custo === '' || body.custo === undefined || body.custo === null
    ? null
    : Number(body.custo),
  forma_entrega: String(body.forma_entrega ?? '').trim() || null,
  forma_pagamento: String(body.forma_pagamento ?? '').trim() || null,
  idioma: String(body.idioma ?? 'pt').trim() || 'pt',
  perguntas_frequentes: Array.isArray(body.perguntas_frequentes)
    ? body.perguntas_frequentes.map(String).map(v => v.trim()).filter(Boolean)
    : [],
  script_abertura: String(body.script_abertura ?? '').trim() || null,
  script_remarketing_24h: String(body.script_remarketing_24h ?? '').trim() || null,
  regras_agente: String(body.regras_agente ?? '').trim() || null,
  ativo: body.ativo === undefined ? true : Boolean(body.ativo),
});

router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('produtos')
    .select('*')
    .eq('user_id', req.user.id)
    .order('criado_em', { ascending: false });

  if (error) {
    return res.status(400).json({ erro: error.message });
  }

  res.json(data || []);
});

router.post('/', async (req, res) => {
  try {
    const payload = {
      ...normalizar(req.body),
      user_id: req.user.id,
    };

    if (!payload.nome_produto) {
      return res.status(400).json({
        erro: 'O nome do produto é obrigatório.',
      });
    }

    const { data, error } = await supabase
      .from('produtos')
      .insert(payload)
      .select('*')
      .single();

    if (error) throw error;

    res.status(201).json({
      produto: data,
      mensagem: 'Produto e treino guardados com sucesso.',
    });
  } catch (e) {
    res.status(400).json({
      erro: e.message || 'Não foi possível guardar o produto.',
    });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const payload = normalizar(req.body);

    if (!payload.nome_produto) {
      return res.status(400).json({
        erro: 'O nome do produto é obrigatório.',
      });
    }

    const { data, error } = await supabase
      .from('produtos')
      .update(payload)
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select('*')
      .single();

    if (error) throw error;

    res.json({
      produto: data,
      mensagem: 'Produto atualizado com sucesso.',
    });
  } catch (e) {
    res.status(400).json({
      erro: e.message || 'Não foi possível atualizar o produto.',
    });
  }
});

router.patch('/:id/estado', async (req, res) => {
  const { data, error } = await supabase
    .from('produtos')
    .update({
      ativo: Boolean(req.body.ativo),
    })
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .select('*')
    .single();

  if (error) {
    return res.status(400).json({ erro: error.message });
  }

  res.json({ produto: data });
});

router.delete('/:id', async (req, res) => {
  const { error } = await supabase
    .from('produtos')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', req.user.id);

  if (error) {
    return res.status(400).json({ erro: error.message });
  }

  res.json({
    ok: true,
    mensagem: 'Produto eliminado.',
  });
});

export default router;
