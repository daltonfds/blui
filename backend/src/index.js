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

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

app.get('/', (req, res) => res.json({ ok: true, servico: 'Blui API' }));

app.use('/api/contactos', contactosRoutes);
app.use('/api/produtos', produtosRoutes);
app.use('/api/campanhas', campanhasRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/sugestoes', sugestoesRoutes);
app.use('/webhooks', webhooksRoutes);
app.use('/api/conversas', conversasRoutes);
app.use('/api/loja', lojaRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/automacoes', automacoesRoutes);
app.use('/api/suporte', suporteRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Blui API a correr na porta ${PORT}`);
  iniciarScheduler();
});
