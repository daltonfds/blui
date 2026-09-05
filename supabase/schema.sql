-- =========================================================
-- BLUI — Schema Supabase (Postgres)
-- Execute este ficheiro no SQL Editor do Supabase (projeto novo)
-- =========================================================

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------
-- PERFIS (1 por utilizador autenticado do Supabase Auth)
-- ---------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text,
  empresa text,
  idioma_padrao text default 'pt',
  criado_em timestamptz default now()
);

-- ---------------------------------------------------------
-- CONFIGURAÇÃO DE PRODUTO / TREINO DO AGENTE (por utilizador)
-- ---------------------------------------------------------
create table if not exists public.produtos (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  nome_produto text not null,
  sobre_produto text,
  forma_entrega text default 'cash_on_delivery',
  forma_pagamento text,
  idioma text default 'pt',
  perguntas_frequentes jsonb default '[]',
  script_abertura text,
  script_remarketing_24h text,
  ativo boolean default true,
  criado_em timestamptz default now()
);

-- ---------------------------------------------------------
-- CONTACTOS / LEADS (o coração do sistema)
-- ---------------------------------------------------------
create table if not exists public.contactos (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  produto_id uuid references public.produtos(id) on delete set null,
  numero text not null,               -- identificador único (E.164)
  nome text,
  email text,
  idade int,
  dor_nicho text,
  canal_origem text default 'whatsapp', -- whatsapp | messenger | instagram | site
  utm_origem text,                     -- de que anúncio veio
  idioma text default 'pt',
  estado text default 'novo',          -- novo | conversando | pendente | comprou | nao_respondeu | follow_up
  valor_comprado numeric default 0,
  ultima_interacao timestamptz default now(),
  ciclo_reiniciado_em timestamptz,
  tentativas_remarketing int default 0,
  criado_em timestamptz default now(),
  unique (user_id, numero)
);

create index if not exists idx_contactos_user_estado on public.contactos(user_id, estado);
create index if not exists idx_contactos_ultima_interacao on public.contactos(ultima_interacao);

-- ---------------------------------------------------------
-- MENSAGENS (memória de conversa, por contacto)
-- ---------------------------------------------------------
create table if not exists public.mensagens (
  id uuid primary key default uuid_generate_v4(),
  contacto_id uuid references public.contactos(id) on delete cascade,
  remetente text not null,   -- 'cliente' | 'agente'
  conteudo text not null,
  canal text,
  criado_em timestamptz default now()
);

create index if not exists idx_mensagens_contacto on public.mensagens(contacto_id, criado_em);

-- ---------------------------------------------------------
-- EVENTOS DE CONVERSÃO (para reenvio às plataformas de ads)
-- ---------------------------------------------------------
create table if not exists public.eventos (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  contacto_id uuid references public.contactos(id) on delete set null,
  tipo text not null,         -- AddToCart | InitiateCheckout | Purchase | Lead
  valor numeric default 0,
  moeda text default 'MZN',
  plataforma_enviada jsonb default '[]', -- ex: ["meta","google","tiktok"]
  event_id text,              -- para deduplicação com pixel do browser
  criado_em timestamptz default now()
);

-- ---------------------------------------------------------
-- CONTAS DE ANÚNCIOS LIGADAS (Meta/Google/TikTok...)
-- ---------------------------------------------------------
create table if not exists public.contas_anuncio (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  plataforma text not null,        -- meta | google | tiktok | pinterest | snapchat | x
  ad_account_id text,
  page_id text,
  pixel_id text,
  access_token text,               -- guardado encriptado ao nível da aplicação
  ligado_em timestamptz default now()
);

-- ---------------------------------------------------------
-- CAMPANHAS CRIADAS AUTOMATICAMENTE
-- ---------------------------------------------------------
create table if not exists public.campanhas (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  conta_anuncio_id uuid references public.contas_anuncio(id) on delete cascade,
  produto_id uuid references public.produtos(id) on delete set null,
  nome text,
  objetivo text,
  orcamento_diario numeric,
  publico_tipo text,          -- generico | personalizado | lookalike
  estado text default 'rascunho', -- rascunho | pausada | ativa | encerrada
  meta_campaign_id text,
  meta_adset_id text,
  meta_creative_id text,
  meta_ad_id text,
  criado_em timestamptz default now()
);

-- ---------------------------------------------------------
-- SUGESTÕES DE MELHORIA (só liberadas com >= 100 contactos)
-- ---------------------------------------------------------
create table if not exists public.sugestoes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  titulo text,
  descricao text,
  categoria text,   -- script | anuncio | funil | site
  criado_em timestamptz default now()
);

-- =========================================================
-- ROW LEVEL SECURITY — cada utilizador só vê os seus dados
-- =========================================================
alter table public.profiles enable row level security;
alter table public.produtos enable row level security;
alter table public.contactos enable row level security;
alter table public.mensagens enable row level security;
alter table public.eventos enable row level security;
alter table public.contas_anuncio enable row level security;
alter table public.campanhas enable row level security;
alter table public.sugestoes enable row level security;

create policy "profiles_self" on public.profiles
  for all using (auth.uid() = id);

create policy "produtos_owner" on public.produtos
  for all using (auth.uid() = user_id);

create policy "contactos_owner" on public.contactos
  for all using (auth.uid() = user_id);

create policy "mensagens_owner" on public.mensagens
  for all using (
    exists (select 1 from public.contactos c where c.id = contacto_id and c.user_id = auth.uid())
  );

create policy "eventos_owner" on public.eventos
  for all using (auth.uid() = user_id);

create policy "contas_anuncio_owner" on public.contas_anuncio
  for all using (auth.uid() = user_id);

create policy "campanhas_owner" on public.campanhas
  for all using (auth.uid() = user_id);

create policy "sugestoes_owner" on public.sugestoes
  for all using (auth.uid() = user_id);

-- =========================================================
-- Trigger: criar profile automaticamente ao registar utilizador
-- =========================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nome)
  values (new.id, new.raw_user_meta_data->>'nome');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
