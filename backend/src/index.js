const twilioRoutes = require('./routes/twilio');
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import contactosRoutes from './routes/contactos.js';
import produtosRoutes from './routes/produtos.js';
import campanhasRoutes from './routes/campanhas.js';
import trackingRoutes from './routes/tracking.js';
import webhooksRoutes from './routes/webhooks.js';
import sugestoesRoutes from './routes/sugestoes.js';
import { iniciarScheduler } from './lib/scheduler.js';
import conversasRoutes from './routes/conversas.js';
import lojaRoutes from './routes/loja.js';
import analyticsRoutes from './routes/analytics.js';
import automacoesRoutes from './routes/automacoes.js';
import suporteRoutes from './routes/suporte.js';
import sitesRoutes from './routes/sites.js';
import categoriasRoutes from './routes/categorias.js';
import assinaturasRoutes from './routes/assinaturas.js';
import adminRoutes from './routes/admin.js';
import { verificarAssinatura } from './middleware/assinatura.js';

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

app.get('/', (req, res) => res.json({ ok: true, servico: 'Blui API' }));

app.use('/api/contactos', verificarAssinatura, contactosRoutes);
app.use('/api/produtos', verificarAssinatura, produtosRoutes);
app.use('/api/campanhas', verificarAssinatura, campanhasRoutes);
app.use('/api/tracking', verificarAssinatura, trackingRoutes);
app.use('/api/sugestoes', verificarAssinatura, sugestoesRoutes);
app.use('/api/conversas', verificarAssinatura, conversasRoutes);
app.use('/api/loja', verificarAssinatura, lojaRoutes);
app.use('/api/analytics', verificarAssinatura, analyticsRoutes);
app.use('/api/automacoes', verificarAssinatura, automacoesRoutes);
app.use('/api/sites', verificarAssinatura, sitesRoutes);
app.use('/api/categorias', verificarAssinatura, categoriasRoutes);

// Sempre acessíveis, mesmo sem assinatura ativa
app.use('/api/suporte', suporteRoutes);
app.use('/api/assinaturas', assinaturasRoutes);
app.use('/api/twilio', twilioRoutes);
app.use('/api/admin', adminRoutes);
app.use('/webhooks', webhooksRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Blui API a correr na porta ${PORT}`);
  iniciarScheduler();
});
