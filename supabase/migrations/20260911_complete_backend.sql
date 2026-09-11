-- BLUI backend growth/intelligence extension.
-- Idempotente: não remove dados nem altera a estrutura comercial existente.

create extension if not exists pgcrypto;

alter table public.contactos add column if not exists lead_score integer not null default 0;
alter table public.contactos add column if not exists ultima_mensagem_inbound timestamptz;
alter table public.contactos add column if not exists sentimento text;
alter table public.contactos add column if not exists objeccao text;
alter table public.contactos add column if not exists prioridade integer not null default 0;
alter table public.contactos add column if not exists blacklist boolean not null default false;
alter table public.contactos add column if not exists recusas_cod integer not null default 0;
alter table public.contactos add column if not exists remarketing_stage integer not null default 0;

alter table public.mensagens add column if not exists tipo text default 'text';
alter table public.mensagens add column if not exists media_url text;
alter table public.mensagens add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table public.mensagens add column if not exists external_id text;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tipo text not null,
  titulo text not null,
  mensagem text,
  dados jsonb not null default '{}'::jsonb,
  lida boolean not null default false,
  criado_em timestamptz not null default now()
);

create table if not exists public.lead_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  contacto_id uuid not null references public.contactos(id) on delete cascade,
  score integer not null default 0 check (score between 0 and 100),
  intencao text,
  sinais jsonb not null default '{}'::jsonb,
  criado_em timestamptz not null default now()
);

create table if not exists public.offer_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  url text not null,
  tipo text default 'oferta',
  score integer check (score between 0 and 100),
  pontos_fortes jsonb not null default '[]'::jsonb,
  promessas jsonb not null default '[]'::jsonb,
  copy text,
  ctas jsonb not null default '[]'::jsonb,
  percurso jsonb not null default '[]'::jsonb,
  melhorias jsonb not null default '[]'::jsonb,
  ab_suggestion jsonb not null default '{}'::jsonb,
  criado_em timestamptz not null default now()
);

create table if not exists public.ad_library_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plataforma text not null default 'facebook',
  external_id text,
  anunciante text,
  palavra_chave text,
  copy text,
  cta text,
  destino text,
  criativo_url text,
  inicio_em timestamptz,
  dados jsonb not null default '{}'::jsonb,
  criado_em timestamptz not null default now()
);

create table if not exists public.supplier_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pais text not null,
  palavra_chave text not null,
  resultados jsonb not null default '[]'::jsonb,
  criado_em timestamptz not null default now()
);

create table if not exists public.ai_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  contacto_id uuid references public.contactos(id) on delete cascade,
  tipo text not null,
  entrada jsonb not null default '{}'::jsonb,
  resultado jsonb not null default '{}'::jsonb,
  criado_em timestamptz not null default now()
);

create index if not exists idx_lead_scores_contact on public.lead_scores(contacto_id, criado_em desc);
create index if not exists idx_ai_analyses_user_type on public.ai_analyses(user_id, tipo, criado_em desc);
create index if not exists idx_contactos_score on public.contactos(user_id, lead_score desc);
create index if not exists idx_contactos_remarketing on public.contactos(user_id, estado, ultima_interacao, ultimo_remarketing_em);

alter table public.notifications enable row level security;
alter table public.lead_scores enable row level security;
alter table public.offer_analyses enable row level security;
alter table public.ad_library_items enable row level security;
alter table public.supplier_searches enable row level security;
alter table public.ai_analyses enable row level security;

do $$
declare t text;
begin
  foreach t in array array['notifications','lead_scores','offer_analyses','ad_library_items','supplier_searches','ai_analyses'] loop
    execute format('drop policy if exists "owner_all_%s" on public.%I', t, t);
    execute format('create policy "owner_all_%s" on public.%I for all using (user_id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)) with check (user_id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true))', t, t);
  end loop;
end $$;
