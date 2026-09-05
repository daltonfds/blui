import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { enviarEventoMetaCAPI } from '../lib/meta.js';

const router = Router();
router.use(requireAuth);

// Regista um evento de conversão e reenvia para as plataformas de anúncios ligadas
router.post('/evento', async (req, res) => {
  const { contactoId, tipo, valor, moeda } = req.body;
  const eventId = uuidv4();

  const { data: contacto } = await supabase
    .from('contactos')
    .select('*')
    .eq('id', contactoId)
    .eq('user_id', req.user.id)
    .single();

  const { data: contas } = await supabase
    .from('contas_anuncio')
    .select('*')
    .eq('user_id', req.user.id);

  const plataformasEnviadas = [];

  for (const conta of contas || []) {
    if (conta.plataforma === 'meta' && conta.pixel_id) {
      try {
        await enviarEventoMetaCAPI({
          pixelId: conta.pixel_id,
          accessToken: conta.access_token,
          evento: tipo,
          contacto,
          valor,
          moeda,
          eventId,
        });
        plataformasEnviadas.push('meta');
      } catch (err) {
        // Não interrompe o fluxo se uma plataforma falhar
        console.error('Erro ao enviar evento para Meta:', err.response?.data || err.message);
      }
    }
    // Espaço reservado para Google Ads / TikTok / Pinterest / Snapchat / X
  }

  const { data, error } = await supabase
    .from('eventos')
    .insert({
      user_id: req.user.id,
      contacto_id: contactoId,
      tipo,
      valor,
      moeda,
      event_id: eventId,
      plataforma_enviada: plataformasEnviadas,
    })
    .select()
    .single();

  if (error) return res.status(400).json({ erro: error.message });

  if (tipo === 'Purchase') {
    await supabase
      .from('contactos')
      .update({ estado: 'comprou', valor_comprado: valor })
      .eq('id', contactoId);
  }

  res.json(data);
});

export default router;
