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

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Blui API a correr na porta ${PORT}`);
  iniciarScheduler();
});
