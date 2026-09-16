import express from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

async function invokeNumerosFunction(req, action, options = {}) {
  const url =
    `${process.env.SUPABASE_URL}/functions/v1/numeros-api?action=${action}` +
    (options.query || '');

  const headers = {
    Authorization: req.headers.authorization,
    apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body,
  });

  const text = await response.text();

  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { erro: text };
  }

  if (!response.ok) {
    const error = new Error(data.erro || 'Erro na API de números.');
    error.status = response.status;
    throw error;
  }

  return data;
}

router.get('/', async (req, res) => {
  try {
    const data = await invokeNumerosFunction(req, 'listas');
    res.json(data);
  } catch (error) {
    console.error('GET /api/numeros:', error);
    res.status(error.status || 500).json({
      erro: error.message || 'Não foi possível carregar as listas.',
    });
  }
});

router.get('/lista/:id', async (req, res) => {
  try {
    const data = await invokeNumerosFunction(req, 'lista', {
      query: `&id=${encodeURIComponent(req.params.id)}`,
    });

    res.json(data);
  } catch (error) {
    console.error('GET /api/numeros/lista:', error);
    res.status(error.status || 404).json({
      erro: error.message || 'Lista não encontrada.',
    });
  }
});

router.post('/manual', async (req, res) => {
  try {
    const data = await invokeNumerosFunction(req, 'manual', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body || {}),
    });

    res.status(201).json(data);
  } catch (error) {
    console.error('POST /api/numeros/manual:', error);
    res.status(error.status || 500).json({
      erro: error.message || 'Não foi possível guardar a lista.',
    });
  }
});

router.post('/imagem', async (req, res) => {
  try {
    const contentType = req.headers['content-type'] || '';

    const response = await fetch(
      `${process.env.SUPABASE_URL}/functions/v1/numeros-api?action=imagem`,
      {
        method: 'POST',
        headers: {
          Authorization: req.headers.authorization,
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
          'Content-Type': contentType,
        },
        body: req,
        duplex: 'half',
      }
    );

    const text = await response.text();

    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { erro: text };
    }

    if (!response.ok) {
      return res.status(response.status).json({
        erro: data.erro || 'Erro ao processar a imagem.',
      });
    }

    res.json(data);
  } catch (error) {
    console.error('POST /api/numeros/imagem:', error);
    res.status(500).json({
      erro: error.message || 'Não foi possível processar a imagem.',
    });
  }
});

router.post('/confirmar', async (req, res) => {
  try {
    const data = await invokeNumerosFunction(req, 'confirmar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body || {}),
    });

    res.status(201).json(data);
  } catch (error) {
    console.error('POST /api/numeros/confirmar:', error);
    res.status(error.status || 500).json({
      erro: error.message || 'Não foi possível guardar a lista.',
    });
  }
});

router.delete('/lista/:id', async (req, res) => {
  try {
    const data = await invokeNumerosFunction(req, 'lista', {
      method: 'DELETE',
      query: `&id=${encodeURIComponent(req.params.id)}`,
    });

    res.json(data || { ok: true });
  } catch (error) {
    console.error('DELETE /api/numeros/lista:', error);
    res.status(error.status || 500).json({
      erro: error.message || 'Não foi possível apagar a lista.',
    });
  }
});

export default router;
