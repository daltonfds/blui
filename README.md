# Blui

Sistema de atendimento conversacional com memória, métricas, remarketing automático,
tracking de conversão e criação automática de campanhas — para WhatsApp, Messenger e Instagram.

---

## Estrutura do repositório

```
blui/
├── backend/          API Node.js + Express (webhooks, agente, campanhas, tracking)
├── frontend/          React + Vite + Tailwind + Framer Motion
├── supabase/
│   └── schema.sql    Schema completo (tabelas, RLS, triggers) — corre no SQL Editor do Supabase
├── setup-termux.sh   Instalação automática para Termux (Android)
└── .gitignore
```

---

## 1. Configurar o Supabase

1. Cria um projeto em https://supabase.com
2. Vai a **SQL Editor** e corre o conteúdo de `supabase/schema.sql`
3. Em **Project Settings → API**, copia:
   - `Project URL`
   - `anon public key` → vai para `frontend/.env`
   - `service_role key` → vai para `backend/.env` (nunca expor no frontend)
4. Em **Authentication → Providers**, confirma que "Email" está ativo.
   Se quiseres pular a confirmação por e-mail em testes, desativa
   "Confirm email" em **Authentication → Settings**.

---

## 2. Correr localmente (computador)

```bash
# Backend
cd backend
cp .env.example .env      # edita com as tuas chaves
npm install
npm run dev

# Frontend (noutro terminal)
cd frontend
cp .env.example .env      # edita com as tuas chaves
npm install
npm run dev
```

Abre `http://localhost:5173`.

---

## 3. Correr no Termux (Android)

```bash
# dentro da pasta blui/ extraída do ZIP
bash setup-termux.sh
```

O script instala Node.js, Git e as dependências de ambos os projetos.
Depois de editar os ficheiros `.env`, corre em duas sessões do Termux:

```bash
# Sessão 1
cd backend && npm start

# Sessão 2
cd frontend && npm run dev -- --host
```

Abre `http://localhost:5173` no browser do telemóvel.

---

## 4. Publicar (deploy)

- **Frontend → Vercel:** importa a pasta `frontend/` como projeto Vercel,
  define as variáveis `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL`.
- **Backend → Vercel (funções serverless) ou um servidor sempre ativo
  (Railway, Render, VPS):** o backend inclui um agendador (`node-cron`) para
  o remarketing de 24h/7 dias. **Funções serverless da Vercel não mantêm
  processos em segundo plano** — para o agendador funcionar continuamente,
  aloja o backend num serviço com processo persistente (Railway, Render,
  um VPS, ou o próprio Termux/telemóvel sempre ligado), ou substitui o
  `node-cron` por um Vercel Cron Job que chama um endpoint a cada 15 min.

---

## 5. Ligar os canais

### WhatsApp (Cloud API da Meta)
1. Cria uma app em https://developers.facebook.com
2. Ativa o produto "WhatsApp"
3. Configura o Webhook: URL = `https://SEU_BACKEND/webhooks/whatsapp`,
   token de verificação = o valor de `META_VERIFY_TOKEN` no `.env`
4. Copia `WHATSAPP_TOKEN` e `WHATSAPP_PHONE_NUMBER_ID` para `backend/.env`

### Messenger / Instagram
Mesmo processo, webhooks em `/webhooks/messenger` e `/webhooks/instagram`,
ativando os produtos "Messenger" e "Instagram" na mesma app da Meta.

### Meta Ads (campanhas automáticas + Conversions API)
Em **Definições**, dentro da plataforma, liga a conta de anúncios com:
`ad_account_id`, `page_id`, `pixel_id` e um token de acesso com permissões
`ads_management` e `ads_read` (requer App Review da Meta para uso em produção).

---

## 6. Fluxo geral

1. Cliente escreve no WhatsApp/Messenger/Instagram → webhook grava o contacto e a mensagem.
2. O agente responde com base no produto configurado em **Produtos**.
3. Se passar 24h sem compra → remarketing automático. Se passar 7 dias → reinício do ciclo.
4. Cada compra confirmada gera um evento reenviado ao Meta (Conversions API).
5. Em **Contactos**, filtra por estado, copia números ou exporta CSV para segmentar anúncios.
6. Em **Campanhas**, cria uma campanha automática a partir dos contactos já recolhidos.
7. Em **Painel**, as sugestões de melhoria só aparecem a partir de 100 contactos reais.

---

## Notas honestas

- O motor de conversa incluído (`backend/src/lib/agente.js`) usa regras simples.
  Para respostas mais naturais, liga-o a um modelo de linguagem (ex: API da
  Anthropic), passando o histórico de `mensagens` do contacto como contexto.
- A criação de campanhas usa a Marketing API do Meta em modo `PAUSED` por
  segurança — revê sempre antes de ativar com orçamento real.
- A app da Meta precisa de passar por **App Review** para usar `ads_management`,
  `whatsapp_business_messaging` e permissões do Instagram em produção — isso
  não depende do código, é um processo de aprovação da própria Meta.
