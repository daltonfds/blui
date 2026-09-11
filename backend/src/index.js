import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import twilioRoutes from './routes/twilio.js';

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
import funilRoutes from './routes/funil.js';
import inteligenciaRoutes from './routes/inteligencia.js';
import analisesRoutes from './routes/analises.js';
import fornecedoresRoutes from './routes/fornecedores.js';
import notificacoesRoutes from './routes/notificacoes.js';
import aiRoutes from './routes/ai.js';


dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || '*',
  })
);

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    ok: true,
    servico: 'Blui API',
    modo: 'desenvolvimento',
    assinatura_obrigatoria: false,
  });
});

// Áreas principais.
// IMPORTANTE:
// A assinatura NÃO bloqueia estas rotas durante o desenvolvimento.
// A autenticação própria de cada rota continua responsável pelo acesso.
app.use('/api/contactos', contactosRoutes);
app.use('/api/produtos', produtosRoutes);
app.use('/api/campanhas', campanhasRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/sugestoes', sugestoesRoutes);
app.use('/api/conversas', conversasRoutes);
app.use('/api/loja', lojaRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/automacoes', automacoesRoutes);
app.use('/api/sites', sitesRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/funil', funilRoutes);
app.use('/api/inteligencia', inteligenciaRoutes);
app.use('/api/analises', analisesRoutes);
app.use('/api/fornecedores', fornecedoresRoutes);
app.use('/api/notificacoes', notificacoesRoutes);
app.use('/api/ai', aiRoutes);


// Suporte
app.use('/api/suporte', suporteRoutes);

// Assinaturas continuam disponíveis para desenvolvimento,
// testes e futura reativação do sistema comercial.
app.use('/api/assinaturas', assinaturasRoutes);

// Integrações
app.use('/api/twilio', twilioRoutes);

// Administração
app.use('/api/admin', adminRoutes);

// Webhooks
app.use('/webhooks', webhooksRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Blui API a correr na porta ${PORT}`);
  console.log('🔓 Modo desenvolvimento: assinatura não obrigatória');
  console.log('🔐 Autenticação continua obrigatória nas áreas protegidas');

  iniciarScheduler();
});
