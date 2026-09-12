import express from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

const texto = (valor, fallback = '') =>
  String(valor ?? fallback).trim();

const perguntas = (valor) =>
  Array.isArray(valor)
    ? valor.map(v => String(v).trim()).filter(Boolean)
    : [];

async function validarProduto(produtoId, userId) {
  if (!produtoId) return true;

  const { data, error } = await supabase
    .from('produtos')
    .select('id')
    .eq('id', produtoId)
    .eq('user_id', userId)
    .single();

  if (error || !data) return false;

  return true;
}

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('funnels')
      .select(`
        *,
        produtos:produto_id(
          id,
          nome_produto,
          preco,
          custo,
          ativo
        ),
        funnel_stages(*)
      `)
      .eq('user_id', req.user.id)
      .order('criado_em', { ascending: false });

    if (error) throw error;

    const funis = (data || []).map(funil => ({
      ...funil,
      funnel_stages: (funil.funnel_stages || [])
        .sort((a, b) => a.ordem - b.ordem),
    }));

    res.json({ funis });
  } catch (e) {
    console.error('[Funil GET]', e);

    res.status(500).json({
      erro: 'Não foi possível carregar os funis.',
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const produtoId = texto(req.body?.produto_id) || null;

    if (produtoId && !(await validarProduto(produtoId, userId))) {
      return res.status(400).json({
        erro: 'O produto selecionado não pertence à tua conta.',
      });
    }

    const { data: funil, error } = await supabase
      .from('funnels')
      .insert({
        user_id: userId,
        produto_id: produtoId,
        nome: texto(req.body?.nome, 'Funil de vendas'),
        objetivo: texto(req.body?.objetivo) || null,
        ativo: true,
      })
      .select('*')
      .single();

    if (error) throw error;

    const etapas = Array.isArray(req.body?.etapas)
      ? req.body.etapas
      : [];

    let stages = [];

    if (etapas.length) {
      const { data, error: stagesError } = await supabase
        .from('funnel_stages')
        .insert(
          etapas.map((etapa, index) => ({
            user_id: userId,
            funnel_id: funil.id,
            ordem: index,
            nome: texto(etapa.nome, `Etapa ${index + 1}`),
            descricao: texto(etapa.descricao) || null,
            objetivo: texto(etapa.objetivo) || null,
            perguntas: perguntas(etapa.perguntas),
            conhecimento: texto(etapa.conhecimento) || null,
            condicao: texto(etapa.condicao) || null,
            acao: texto(etapa.acao) || null,
          }))
        )
        .select('*')
        .order('ordem');

      if (stagesError) throw stagesError;

      stages = data || [];
    }

    res.status(201).json({
      mensagem: 'Funil criado com sucesso.',
      funil: {
        ...funil,
        funnel_stages: stages,
      },
    });
  } catch (e) {
    console.error('[Funil POST]', e);

    res.status(400).json({
      erro: e.message || 'Não foi possível criar o funil.',
    });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const produtoId = texto(req.body?.produto_id) || null;

    if (
      produtoId &&
      !(await validarProduto(produtoId, req.user.id))
    ) {
      return res.status(400).json({
        erro: 'O produto selecionado não pertence à tua conta.',
      });
    }

    const { data, error } = await supabase
      .from('funnels')
      .update({
        produto_id: produtoId,
        nome: texto(req.body?.nome, 'Funil de vendas'),
        objetivo: texto(req.body?.objetivo) || null,
        ativo:
          req.body?.ativo === undefined
            ? true
            : Boolean(req.body.ativo),
        atualizado_em: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select('*')
      .single();

    if (error) throw error;

    res.json({
      mensagem: 'Funil atualizado com sucesso.',
      funil: data,
    });
  } catch (e) {
    res.status(400).json({
      erro: e.message || 'Não foi possível atualizar o funil.',
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('funnels')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) throw error;

    res.json({ success: true });
  } catch (e) {
    res.status(400).json({
      erro: e.message || 'Não foi possível eliminar o funil.',
    });
  }
});

router.post('/:id/etapas', async (req, res) => {
  try {
    const { data: ultimo } = await supabase
      .from('funnel_stages')
      .select('ordem')
      .eq('funnel_id', req.params.id)
      .eq('user_id', req.user.id)
      .order('ordem', { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data, error } = await supabase
      .from('funnel_stages')
      .insert({
        user_id: req.user.id,
        funnel_id: req.params.id,
        ordem: (ultimo?.ordem ?? -1) + 1,
        nome: texto(req.body?.nome, 'Nova etapa'),
        descricao: texto(req.body?.descricao) || null,
        objetivo: texto(req.body?.objetivo) || null,
        perguntas: perguntas(req.body?.perguntas),
        conhecimento: texto(req.body?.conhecimento) || null,
        condicao: texto(req.body?.condicao) || null,
        acao: texto(req.body?.acao) || null,
      })
      .select('*')
      .single();

    if (error) throw error;

    res.status(201).json({ etapa: data });
  } catch (e) {
    res.status(400).json({
      erro: e.message || 'Não foi possível criar a etapa.',
    });
  }
});

router.put('/:id/etapas/:stageId', async (req, res) => {
  try {
    const updates = {};

    for (
      const campo of [
        'nome',
        'descricao',
        'objetivo',
        'conhecimento',
        'condicao',
        'acao',
      ]
    ) {
      if (req.body?.[campo] !== undefined) {
        updates[campo] =
          texto(req.body[campo]) || null;
      }
    }

    if (req.body?.perguntas !== undefined) {
      updates.perguntas = perguntas(req.body.perguntas);
    }

    if (Number.isInteger(req.body?.ordem)) {
      updates.ordem = req.body.ordem;
    }

    updates.atualizado_em = new Date().toISOString();

    const { data, error } = await supabase
      .from('funnel_stages')
      .update(updates)
      .eq('id', req.params.stageId)
      .eq('funnel_id', req.params.id)
      .eq('user_id', req.user.id)
      .select('*')
      .single();

    if (error) throw error;

    res.json({ etapa: data });
  } catch (e) {
    res.status(400).json({
      erro: e.message || 'Não foi possível atualizar a etapa.',
    });
  }
});

router.delete('/:id/etapas/:stageId', async (req, res) => {
  try {
    const { error } = await supabase
      .from('funnel_stages')
      .delete()
      .eq('id', req.params.stageId)
      .eq('funnel_id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) throw error;

    res.json({ success: true });
  } catch (e) {
    res.status(400).json({
      erro: e.message || 'Não foi possível eliminar a etapa.',
    });
  }
});

router.put('/:id/etapas-ordem', async (req, res) => {
  try {
    const ids = Array.isArray(req.body?.ids)
      ? req.body.ids
      : [];

    for (let i = 0; i < ids.length; i += 1) {
      const { error } = await supabase
        .from('funnel_stages')
        .update({
          ordem: i,
          atualizado_em: new Date().toISOString(),
        })
        .eq('id', ids[i])
        .eq('funnel_id', req.params.id)
        .eq('user_id', req.user.id);

      if (error) throw error;
    }

    res.json({ success: true });
  } catch (e) {
    res.status(400).json({
      erro: e.message || 'Não foi possível ordenar as etapas.',
    });
  }
});

router.get('/:id/contactos', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('contact_funnel_stage')
      .select(
        'contacto_id,stage_id,entrou_em,atualizado_em,contactos:contacto_id(*)'
      )
      .eq('funnel_id', req.params.id)
      .eq('user_id', req.user.id)
      .order('atualizado_em', { ascending: false });

    if (error) throw error;

    res.json({ contactos: data || [] });
  } catch {
    res.status(500).json({
      erro: 'Não foi possível carregar os contactos.',
    });
  }
});

router.post(
  '/:id/contactos/:contactoId/mover',
  async (req, res) => {
    try {
      const stageId = req.body?.stage_id;

      const { data: stage, error: stageError } =
        await supabase
          .from('funnel_stages')
          .select('*')
          .eq('id', stageId)
          .eq('funnel_id', req.params.id)
          .eq('user_id', req.user.id)
          .single();

      if (stageError) throw stageError;

      const { data, error } = await supabase
        .from('contact_funnel_stage')
        .upsert(
          {
            contacto_id: req.params.contactoId,
            funnel_id: req.params.id,
            stage_id: stage.id,
            user_id: req.user.id,
            atualizado_em: new Date().toISOString(),
          },
          {
            onConflict: 'contacto_id,funnel_id',
          }
        )
        .select('*')
        .single();

      if (error) throw error;

      res.json({
        success: true,
        etapa: stage,
        atribuicao: data,
      });
    } catch (e) {
      res.status(400).json({
        erro:
          e.message ||
          'Não foi possível mover o contacto.',
      });
    }
  }
);

export default router;
