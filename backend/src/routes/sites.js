import express from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('sites')
    .select('*, site_pages(*)')
    .eq('user_id', req.user.id)
    .order('criado_em', { ascending: false });

  if (error) {
    console.error(error);
    return res.status(500).json({ erro: error.message });
  }

  res.json(data || []);
});

router.post('/', async (req, res) => {
  const {
    nome,
    dominio = null,
    estado = 'rascunho',
  } = req.body || {};

  if (!nome?.trim()) {
    return res.status(400).json({ erro: 'O nome do site é obrigatório.' });
  }

  const { data, error } = await supabase
    .from('sites')
    .insert({
      user_id: req.user.id,
      nome: nome.trim(),
      dominio,
      estado,
    })
    .select('*')
    .single();

  if (error) {
    console.error(error);
    return res.status(500).json({ erro: error.message });
  }

  res.status(201).json(data);
});

router.patch('/:id', async (req, res) => {
  const permitidos = ['nome', 'dominio', 'estado'];
  const dados = {};

  for (const campo of permitidos) {
    if (req.body?.[campo] !== undefined) {
      dados[campo] = req.body[campo];
    }
  }

  const { data, error } = await supabase
    .from('sites')
    .update(dados)
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .select('*')
    .single();

  if (error) {
    console.error(error);
    return res.status(500).json({ erro: error.message });
  }

  res.json(data);
});

router.delete('/:id', async (req, res) => {
  const { error } = await supabase
    .from('sites')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', req.user.id);

  if (error) {
    console.error(error);
    return res.status(500).json({ erro: error.message });
  }

  res.json({ ok: true });
});

router.post('/:id/paginas', async (req, res) => {
  const {
    slug,
    titulo,
    conteudo = {},
    publicado = false,
  } = req.body || {};

  if (!slug?.trim() || !titulo?.trim()) {
    return res.status(400).json({
      erro: 'slug e titulo são obrigatórios.',
    });
  }

  const { data: site, error: siteError } = await supabase
    .from('sites')
    .select('id')
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .maybeSingle();

  if (siteError) {
    return res.status(500).json({ erro: siteError.message });
  }

  if (!site) {
    return res.status(404).json({ erro: 'Site não encontrado.' });
  }

  const { data, error } = await supabase
    .from('site_pages')
    .insert({
      site_id: site.id,
      slug: slug.trim(),
      titulo: titulo.trim(),
      conteudo,
      publicado,
    })
    .select('*')
    .single();

  if (error) {
    console.error(error);
    return res.status(500).json({ erro: error.message });
  }

  res.status(201).json(data);
});

router.patch('/:id/paginas/:paginaId', async (req, res) => {
  const { data: site, error: siteError } = await supabase
    .from('sites')
    .select('id')
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .maybeSingle();

  if (siteError) {
    return res.status(500).json({ erro: siteError.message });
  }

  if (!site) {
    return res.status(404).json({ erro: 'Site não encontrado.' });
  }

  const permitidos = ['slug', 'titulo', 'conteudo', 'publicado'];
  const dados = {};

  for (const campo of permitidos) {
    if (req.body?.[campo] !== undefined) {
      dados[campo] = req.body[campo];
    }
  }

  const { data, error } = await supabase
    .from('site_pages')
    .update(dados)
    .eq('id', req.params.paginaId)
    .eq('site_id', site.id)
    .select('*')
    .single();

  if (error) {
    console.error(error);
    return res.status(500).json({ erro: error.message });
  }

  res.json(data);
});

router.delete('/:id/paginas/:paginaId', async (req, res) => {
  const { data: site, error: siteError } = await supabase
    .from('sites')
    .select('id')
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .maybeSingle();

  if (siteError) {
    return res.status(500).json({ erro: siteError.message });
  }

  if (!site) {
    return res.status(404).json({ erro: 'Site não encontrado.' });
  }

  const { error } = await supabase
    .from('site_pages')
    .delete()
    .eq('id', req.params.paginaId)
    .eq('site_id', site.id);

  if (error) {
    console.error(error);
    return res.status(500).json({ erro: error.message });
  }

  res.json({ ok: true });
});

export default router;
