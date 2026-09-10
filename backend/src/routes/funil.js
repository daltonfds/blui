import express from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

const clean = (v, fallback = '') => String(v ?? fallback).trim();
const questions = (v) => Array.isArray(v) ? v.map(clean).filter(Boolean) : [];

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('funnels')
      .select('*, funnel_stages(*)')
      .eq('user_id', req.user.id)
      .order('criado_em', { ascending: false });

    if (error) throw error;

    const funis = (data || []).map(f => ({
      ...f,
      funnel_stages: (f.funnel_stages || []).sort((a, b) => a.ordem - b.ordem),
    }));

    res.json({ funis });
  } catch (e) {
    console.error('[Funil GET]', e);
    res.status(500).json({ erro: 'Não foi possível carregar os funis.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const user_id = req.user.id;
    const { data: funil, error } = await supabase
      .from('funnels')
      .insert({
        user_id,
        nome: clean(req.body?.nome, 'Funil de Vendas'),
        objetivo: clean(req.body?.objetivo) || null,
      })
      .select('*')
      .single();

    if (error) throw error;

    const etapas = Array.isArray(req.body?.etapas) ? req.body.etapas : [];
    let stages = [];

    if (etapas.length) {
      const { data, error: e } = await supabase
        .from('funnel_stages')
        .insert(etapas.map((x, i) => ({
          user_id,
          funnel_id: funil.id,
          ordem: i,
          nome: clean(x.nome, `Etapa ${i + 1}`),
          descricao: clean(x.descricao) || null,
          objetivo: clean(x.objetivo) || null,
          perguntas: questions(x.perguntas),
          conhecimento: clean(x.conhecimento) || null,
          condicao: clean(x.condicao) || null,
          acao: clean(x.acao) || null,
        })))
        .select('*')
        .order('ordem');

      if (e) throw e;
      stages = data || [];
    }

    res.status(201).json({ funil: { ...funil, funnel_stages: stages } });
  } catch (e) {
    console.error('[Funil POST]', e);
    res.status(400).json({ erro: e.message || 'Não foi possível criar o funil.' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('funnels')
      .update({
        nome: clean(req.body?.nome, 'Funil de Vendas'),
        objetivo: clean(req.body?.objetivo) || null,
        ativo: req.body?.ativo === undefined ? true : Boolean(req.body.ativo),
        atualizado_em: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select('*')
      .single();

    if (error) throw error;
    res.json({ funil: data });
  } catch (e) {
    console.error('[Funil PUT]', e);
    res.status(400).json({ erro: e.message || 'Não foi possível atualizar o funil.' });
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
    console.error('[Funil DELETE]', e);
    res.status(400).json({ erro: e.message || 'Não foi possível eliminar o funil.' });
  }
});

router.post('/:id/etapas', async (req, res) => {
  try {
    const user_id = req.user.id;
    const funnel_id = req.params.id;

    const { data: last } = await supabase
      .from('funnel_stages')
      .select('ordem')
      .eq('funnel_id', funnel_id)
      .eq('user_id', user_id)
      .order('ordem', { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data, error } = await supabase
      .from('funnel_stages')
      .insert({
        user_id,
        funnel_id,
        ordem: (last?.ordem ?? -1) + 1,
        nome: clean(req.body?.nome, 'Nova etapa'),
        descricao: clean(req.body?.descricao) || null,
        objetivo: clean(req.body?.objetivo) || null,
        perguntas: questions(req.body?.perguntas),
        conhecimento: clean(req.body?.conhecimento) || null,
        condicao: clean(req.body?.condicao) || null,
        acao: clean(req.body?.acao) || null,
      })
      .select('*')
      .single();

    if (error) throw error;
    res.status(201).json({ etapa: data });
  } catch (e) {
    console.error('[Funil etapa POST]', e);
    res.status(400).json({ erro: e.message || 'Não foi possível criar a etapa.' });
  }
});

router.put('/:id/etapas/:stageId', async (req, res) => {
  try {
    const updates = {};
    for (const key of ['nome', 'descricao', 'objetivo', 'conhecimento', 'condicao', 'acao']) {
      if (req.body?.[key] !== undefined) updates[key] = clean(req.body[key]) || null;
    }
    if (req.body?.perguntas !== undefined) updates.perguntas = questions(req.body.perguntas);
    if (Number.isInteger(req.body?.ordem)) updates.ordem = req.body.ordem;
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
    console.error('[Funil etapa PUT]', e);
    res.status(400).json({ erro: e.message || 'Não foi possível atualizar a etapa.' });
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
    console.error('[Funil etapa DELETE]', e);
    res.status(400).json({ erro: e.message || 'Não foi possível eliminar a etapa.' });
  }
});

router.put('/:id/etapas-ordem', async (req, res) => {
  try {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];

    for (let i = 0; i < ids.length; i++) {
      const { error } = await supabase
        .from('funnel_stages')
        .update({ ordem: i, atualizado_em: new Date().toISOString() })
        .eq('id', ids[i])
        .eq('funnel_id', req.params.id)
        .eq('user_id', req.user.id);

      if (error) throw error;
    }

    res.json({ success: true });
  } catch (e) {
    console.error('[Funil ordem PUT]', e);
    res.status(400).json({ erro: e.message || 'Não foi possível ordenar as etapas.' });
  }
});

router.get('/:id/contactos', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('contact_funnel_stage')
      .select('contacto_id,stage_id,entrou_em,atualizado_em,contactos:contacto_id(*)')
      .eq('funnel_id', req.params.id)
      .eq('user_id', req.user.id)
      .order('atualizado_em', { ascending: false });

    if (error) throw error;
    res.json({ contactos: data || [] });
  } catch (e) {
    console.error('[Funil contactos GET]', e);
    res.status(500).json({ erro: 'Não foi possível carregar os contactos.' });
  }
});

router.post('/:id/contactos/:contactoId/mover', async (req, res) => {
  try {
    const stageId = req.body?.stage_id;

    const { data: stage, error: stageError } = await supabase
      .from('funnel_stages')
      .select('*')
      .eq('id', stageId)
      .eq('funnel_id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (stageError) throw stageError;

    const { data, error } = await supabase
      .from('contact_funnel_stage')
      .upsert({
        contacto_id: req.params.contactoId,
        funnel_id: req.params.id,
        stage_id: stage.id,
        user_id: req.user.id,
        atualizado_em: new Date().toISOString(),
      }, { onConflict: 'contacto_id,funnel_id' })
      .select('*')
      .single();

    if (error) throw error;
    res.json({ success: true, etapa: stage, atribuicao: data });
  } catch (e) {
    console.error('[Funil mover]', e);
    res.status(400).json({ erro: e.message || 'Não foi possível mover o contacto.' });
  }
});

export default router;
