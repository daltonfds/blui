-- BLUI — consolidação da plataforma
-- Esta migração é idempotente.

create index if not exists idx_sites_user_criado
  on public.sites(user_id, criado_em desc);

create index if not exists idx_site_pages_site_criado
  on public.site_pages(site_id, criado_em desc);

create index if not exists idx_categorias_user_nome
  on public.categorias_produtos(user_id, nome);

create index if not exists idx_orders_user_estado_criado
  on public.orders(user_id, estado, criado_em desc);

create index if not exists idx_carts_user_estado_atualizado
  on public.carts(user_id, estado, atualizado_em desc);

create index if not exists idx_analytics_user_tipo_criado
  on public.analytics_events(user_id, tipo, criado_em desc);

create index if not exists idx_usage_user_criado
  on public.usage_events(user_id, criado_em desc);

create index if not exists idx_support_user_estado
  on public.support_tickets(user_id, estado, atualizado_em desc);

create index if not exists idx_automacoes_user_tipo_ativo
  on public.automacoes(user_id, tipo, ativo);

alter table if exists public.sites enable row level security;
alter table if exists public.site_pages enable row level security;
alter table if exists public.categorias_produtos enable row level security;

drop policy if exists sites_owner on public.sites;
create policy sites_owner
on public.sites
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists categorias_owner on public.categorias_produtos;
create policy categorias_owner
on public.categorias_produtos
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists site_pages_owner on public.site_pages;
create policy site_pages_owner
on public.site_pages
for all
to authenticated
using (
  exists (
    select 1
    from public.sites s
    where s.id = site_pages.site_id
      and s.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.sites s
    where s.id = site_pages.site_id
      and s.user_id = auth.uid()
  )
);
