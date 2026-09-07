import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';
import { enviarMensagemWhatsApp } from '../lib/whatsapp.js';

const router = express.Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('contactos')
    .select('id,nome,numero,email,estado,ultima_interacao,canal_origem')
    .eq('user_id', req.user.id)
    .order('ultima_interacao', { ascending: false, nullsFirst: false });

  if (error) return res.status(500).json({ erro: error.message });
  res.json(data || []);
});

router.get('/:contactoId/mensagens', async (req, res) => {
  const { data: contacto } = await supabase
    .from('contactos')
    .select('id')
    .eq('id', req.params.contactoId)
    .eq('user_id', req.user.id)
    .maybeSingle();

  if (!contacto) return res.status(404).json({ erro: 'Contacto não encontrado.' });

  const { data, error } = await supabase
    .from('mensagens')
    .select('*')
    .eq('contacto_id', contacto.id)
    .order('criado_em', { ascending: true });

  if (error) return res.status(500).json({ erro: error.message });
  res.json(data || []);
});

router.post('/:contactoId/mensagens', async (req, res) => {
  const texto = String(req.body?.conteudo || '').trim();
  if (!texto) return res.status(400).json({ erro: 'Mensagem vazia.' });

  const { data: contacto } = await supabase
    .from('contactos')
    .select('*')
    .eq('id', req.params.contactoId)
    .eq('user_id', req.user.id)
    .maybeSingle();

  if (!contacto) return res.status(404).json({ erro: 'Contacto não encontrado.' });

  let envio = null;

  if (contacto.numero) {
    const { data: conta } = await supabase
      .from('contas_anuncio')
      .select('access_token,whatsapp_phone_number_id')
      .eq('user_id', req.user.id)
      .eq('plataforma', 'whatsapp')
      .not('access_token', 'is', null)
      .limit(1)
      .maybeSingle();

    try {
      envio = await enviarMensagemWhatsApp({
        numero: contacto.numero,
        texto,
        accessToken: conta?.access_token,
        phoneNumberId: conta?.whatsapp_phone_number_id,
      });
    } catch (err) {
      return res.status(502).json({ erro: 'Falha ao enviar WhatsApp.', detalhe: err.message });
    }
  }

  const { data: mensagem, error } = await supabase
    .from('mensagens')
    .insert({
      contacto_id: contacto.id,
      remetente: 'utilizador',
      conteudo: texto,
      canal: contacto.canal_origem || 'whatsapp',
    })
    .select()
    .single();

  if (error) return res.status(500).json({ erro: error.message });

  await supabase
    .from('contactos')
    .update({ ultima_interacao: new Date().toISOString() })
    .eq('id', contacto.id)
    .eq('user_id', req.user.id);

  res.json({ mensagem, envio });
});

export default router;
