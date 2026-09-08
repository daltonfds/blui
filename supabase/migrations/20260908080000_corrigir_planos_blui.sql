-- BLUI — preços e validade oficiais dos planos
-- Tester: $1 / 7 dias
-- Starter: $5 / 30 dias
-- Growth: $9 / 30 dias
-- Pro: $14 / 30 dias

update public.planos
set preco_brl = case nome
  when 'Teste' then 1
  when 'Tester' then 1
  when 'Starter' then 5
  when 'Growth' then 9
  when 'Pro' then 14
  else preco_brl
end,
dias_validade = case
  when nome in ('Teste', 'Tester') then 7
  when nome in ('Starter', 'Growth', 'Pro') then 30
  else dias_validade
end,
ativo = true
where nome in ('Teste', 'Tester', 'Starter', 'Growth', 'Pro');

update public.planos
set nome = 'Tester'
where nome = 'Teste';
