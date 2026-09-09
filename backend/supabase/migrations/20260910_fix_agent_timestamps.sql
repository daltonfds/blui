-- BLUI: compatibilidade do agente com histórico/produtos

alter table if exists public.produtos
  add column if not exists created_at timestamptz default now();

alter table if exists public.mensagens
  add column if not exists created_at timestamptz default now();

update public.produtos
set created_at = now()
where created_at is null;

update public.mensagens
set created_at = now()
where created_at is null;
