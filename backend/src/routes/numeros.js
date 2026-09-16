import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('listas_numeros')
      .select('id,nome,numeros,origem,criado_em')
      .eq('user_id', req.user.id)
      .order('criado_em', { ascending: false });

    if (error) throw error;

    res.json((data || []).map((lista) => ({
      id: lista.id,
      nome: lista.nome || 'Lista sem nome',
      total: Array.isArray(lista.numeros) ? lista.numeros.length : 0,
      origem: lista.origem || 'manual',
      criado_em: lista.criado_em,
    })));
  } catch (error) {
    console.error('GET /api/numeros:', error);
    res.status(500).json({ erro: 'Não foi possível carregar as listas.' });
  }
});

router.get('/lista/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('listas_numeros')
      .select('id,nome,numeros,origem,criado_em')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (error) throw error;

    res.json({
      id: data.id,
      nome: data.nome,
      numeros: Array.isArray(data.numeros) ? data.numeros : [],
      origem: data.origem,
      criado_em: data.criado_em,
    });
  } catch (error) {
    console.error('GET /api/numeros/lista:', error);
    res.status(404).json({ erro: 'Lista não encontrada.' });
  }
});

router.post('/manual', async (req, res) => {
  try {
    const { texto, nome, paisPadrao = 'MZ' } = req.body || {};

    if (!texto?.trim()) {
      return res.status(400).json({ erro: 'Introduza pelo menos um número.' });
    }

    const linhas = texto
      .split(/[\n,;]+/)
      .map((n) => n.trim())
      .filter(Boolean);

    const numeros = [];
    const vistos = new Set();

    for (const numero of linhas) {
      const limpo = numero.replace(/[^\d+]/g, '');

      if (!limpo || limpo.length < 7) continue;

      let formatado = limpo;

      if (!limpo.startsWith('+')) {
        const prefixos = {
          MZ: '+258',
          ZA: '+27',
          AO: '+244',
          BR: '+55',
          PT: '+351',
        };

        const prefixo = prefixos[paisPadrao] || '+258';
        const semZero = limpo.startsWith('0') ? limpo.slice(1) : limpo;
        formatado = `${prefixo}${semZero}`;
      }

      if (!vistos.has(formatado)) {
        vistos.add(formatado);
        numeros.push({
          numero: formatado,
          formatado,
          pais: paisPadrao,
        });
      }
    }

    if (numeros.length === 0) {
      return res.status(400).json({ erro: 'Nenhum número válido foi encontrado.' });
    }

    const { data, error } = await supabase
      .from('listas_numeros')
      .insert({
        user_id: req.user.id,
        nome: nome || `Lista ${new Date().toLocaleDateString('pt-PT')}`,
        numeros,
        origem: 'manual',
      })
      .select('id,nome,numeros,origem,criado_em')
      .single();

    if (error) throw error;

    res.status(201).json({
      lista: {
        ...data,
        total: numeros.length,
      },
    });
  } catch (error) {
    console.error('POST /api/numeros/manual:', error);
    res.status(500).json({ erro: 'Não foi possível guardar a lista.' });
  }
});

router.post('/confirmar', async (req, res) => {
  try {
    const numeros = Array.isArray(req.body?.numeros) ? req.body.numeros : [];

    if (!numeros.length) {
      return res.status(400).json({ erro: 'Nenhum número para guardar.' });
    }

    const { data, error } = await supabase
      .from('listas_numeros')
      .insert({
        user_id: req.user.id,
        nome: `Lista de imagens ${new Date().toLocaleDateString('pt-PT')}`,
        numeros,
        origem: 'imagem',
      })
      .select('id,nome,numeros,origem,criado_em')
      .single();

    if (error) throw error;

    res.status(201).json({
      lista: {
        ...data,
        total: numeros.length,
      },
    });
  } catch (error) {
    console.error('POST /api/numeros/confirmar:', error);
    res.status(500).json({ erro: 'Não foi possível guardar a lista.' });
  }
});

router.delete('/lista/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('listas_numeros')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) throw error;

    res.json({ ok: true });
  } catch (error) {
    console.error('DELETE /api/numeros/lista:', error);
    res.status(500).json({ erro: 'Não foi possível apagar a lista.' });
  }
});

export default router;
