-- BLUI
-- Permite que o utilizador autenticado veja apenas a sua própria assinatura.
-- Necessário para a RotaProtegida consultar diretamente o Supabase.

alter table public.assinaturas enable row level security;

drop policy if exists "utilizador pode ver a propria assinatura"
on public.assinaturas;

create policy "utilizador pode ver a propria assinatura"
on public.assinaturas
for select
to authenticated
using (
  (select auth.uid()) = user_id
);

-- O utilizador precisa conseguir consultar os dados públicos
-- do plano associado.
alter table public.planos enable row level security;

drop policy if exists "utilizador autenticado pode ver planos ativos"
on public.planos;

create policy "utilizador autenticado pode ver planos ativos"
on public.planos
for select
to authenticated
using (
  ativo = true
);
