import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { supabase } from '../lib/supabaseClient.js';
import Wordmark from './Wordmark.jsx';
import {
  IconGrid,
  IconPeople,
  IconLayers,
  IconBolt,
  IconSettings,
  IconLogout,
} from './Icons.jsx';

const grupos = [
  {
    titulo: 'PAINEL',
    itens: [
      { to: '/painel', label: 'Visão geral', Icon: IconGrid },
      { to: '/painel/funil', label: 'Funil', Icon: IconGrid },
      { to: '/painel/receita', label: 'Receita', Icon: IconGrid },
      { to: '/analytics', label: 'Analytics', Icon: IconGrid },
      { to: '/painel/oportunidades', label: 'Oportunidades', Icon: IconGrid },
    ],
  },
  {
    titulo: 'NÚMEROS',
    itens: [
      { to: '/numeros', label: 'Ler números de imagens', Icon: IconLayers },
    ],
  },
  {
    titulo: 'CONTACTOS',
    itens: [
      { to: '/contactos', label: 'Todos', Icon: IconPeople },
      { to: '/contactos/leads', label: 'Leads', Icon: IconPeople },
      { to: '/contactos/clientes', label: 'Clientes', Icon: IconPeople },
      { to: '/contactos/segmentos', label: 'Segmentos', Icon: IconPeople },
      { to: '/contactos/etiquetas', label: 'Etiquetas', Icon: IconPeople },
    ],
  },
  {
    titulo: 'CONVERSAS',
    itens: [
      { to: '/conversas', label: 'Todas', Icon: IconPeople },
      { to: '/conversas/whatsapp', label: 'WhatsApp', Icon: IconPeople },
      { to: '/conversas/instagram', label: 'Instagram', Icon: IconPeople },
      { to: '/conversas/messenger', label: 'Messenger', Icon: IconPeople },
      { to: '/conversas/site', label: 'Site', Icon: IconPeople },
    ],
  },
  {
    titulo: 'PRODUTOS',
    itens: [
      { to: '/produtos', label: 'Produtos', Icon: IconLayers },
      { to: '/produtos/categorias', label: 'Categorias', Icon: IconLayers },
      { to: '/produtos/faq', label: 'FAQ', Icon: IconLayers },
      { to: '/produtos/agente', label: 'Base do agente', Icon: IconLayers },
    ],
  },
  {
    titulo: 'LOJA',
    itens: [
      { to: '/loja', label: 'Loja', Icon: IconLayers },
      { to: '/loja/produtos', label: 'Produtos', Icon: IconLayers },
      { to: '/loja/pedidos', label: 'Pedidos', Icon: IconLayers },
      { to: '/loja/carrinhos', label: 'Carrinhos', Icon: IconLayers },
      { to: '/loja/checkout', label: 'Checkout', Icon: IconLayers },
    ],
  },
  {
    titulo: 'SITES',
    itens: [
      { to: '/sites', label: 'Landing pages', Icon: IconLayers },
      { to: '/sites/paginas-venda', label: 'Páginas de venda', Icon: IconLayers },
      { to: '/sites/formularios', label: 'Formulários', Icon: IconLayers },
      { to: '/sites/dominios', label: 'Domínios', Icon: IconLayers },
    ],
  },
  {
    titulo: 'CAMPANHAS',
    itens: [
      { to: '/campanhas', label: 'Anúncios', Icon: IconBolt },
      { to: '/campanhas/publicos', label: 'Públicos', Icon: IconBolt },
      { to: '/campanhas/remarketing', label: 'Remarketing', Icon: IconBolt },
      { to: '/campanhas/resultados', label: 'Resultados', Icon: IconBolt },
    ],
  },
  {
    titulo: 'AUTOMAÇÕES',
    itens: [
      { to: '/automacoes', label: 'Todas', Icon: IconBolt },
      { to: '/automacoes/remarketing', label: 'Remarketing', Icon: IconBolt },
      {
        to: '/automacoes/carrinho-abandonado',
        label: 'Carrinho abandonado',
        Icon: IconBolt,
      },
      {
        to: '/automacoes/checkout-abandonado',
        label: 'Checkout abandonado',
        Icon: IconBolt,
      },
      { to: '/automacoes/pos-venda', label: 'Pós-venda', Icon: IconBolt },
      { to: '/automacoes/reativacao', label: 'Reativação', Icon: IconBolt },
    ],
  },
  {
    titulo: 'DEFINIÇÕES',
    itens: [
      { to: '/definicoes', label: 'Minha conta', Icon: IconSettings },
      { to: '/definicoes/negocio', label: 'Negócio', Icon: IconSettings },
      { to: '/definicoes/agente', label: 'Agente', Icon: IconSettings },
      { to: '/definicoes/canais', label: 'Canais', Icon: IconSettings },
      { to: '/definicoes/meta', label: 'Meta', Icon: IconSettings },
      { to: '/definicoes/pagamentos', label: 'Pagamentos', Icon: IconSettings },
      { to: '/definicoes/entregas', label: 'Entregas', Icon: IconSettings },
      { to: '/definicoes/automacoes', label: 'Automações', Icon: IconSettings },
      { to: '/definicoes/seguranca', label: 'Segurança', Icon: IconSettings },
    ],
  },
];

function Item({ to, label, Icon }) {
  return (
    <NavLink
      to={to}
      end={to === '/painel' || to === '/contactos' || to === '/conversas' ||
        to === '/produtos' || to === '/loja' || to === '/sites' ||
        to === '/campanhas' || to === '/automacoes' || to === '/definicoes'}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xs px-3 py-2 text-sm font-medium transition-colors ${
          isActive
            ? 'bg-brand-50 text-brand-700'
            : 'text-base-ink/70 hover:bg-base-fog hover:text-base-ink'
        }`
      }
    >
      <Icon />
      <span>{label}</span>
    </NavLink>
  );
}

export default function Sidebar() {
  const { sair } = useAuth();
  const navigate = useNavigate();
  const [ehAdmin, setEhAdmin] = useState(false);

  useEffect(() => {
    let ativo = true;

    supabase.rpc('is_admin').then(({ data }) => {
      if (ativo) setEhAdmin(!!data);
    });

    return () => {
      ativo = false;
    };
  }, []);

  async function terminarSessao() {
    await sair();
    navigate('/entrar');
  }

  return (
    <aside className="hidden md:flex md:flex-col w-64 shrink-0 border-r border-black/5 bg-base-white px-3 py-5 overflow-y-auto">
      <div className="px-3 mb-6">
        <Wordmark />
      </div>

      <nav className="flex-1 space-y-5">
        {grupos.map((grupo) => (
          <section key={grupo.titulo}>
            <div className="px-3 mb-1.5 text-[10px] font-bold tracking-[0.14em] text-base-ink/40">
              {grupo.titulo}
            </div>

            <div className="space-y-0.5">
              {grupo.itens.map((item) => (
                <Item key={item.to} {...item} />
              ))}
            </div>
          </section>
        ))}

        <section>
          <div className="px-3 mb-1.5 text-[10px] font-bold tracking-[0.14em] text-base-ink/40">
            CONTA
          </div>

          <Item
            to="/assinatura"
            label="Assinatura"
            Icon={IconSettings}
          />

          <Item
            to="/suporte"
            label="Suporte"
            Icon={IconPeople}
          />

          {ehAdmin && (
            <Item
              to="/admin"
              label="Admin"
              Icon={IconBolt}
            />
          )}
        </section>
      </nav>

      <div className="pt-4 mt-4 border-t border-black/5">
        <button
          onClick={terminarSessao}
          className="w-full flex items-center gap-3 rounded-xs px-3 py-2.5 text-sm font-medium text-base-ink/60 hover:bg-base-fog hover:text-signal-red transition-colors"
        >
          <IconLogout />
          <span>Terminar sessão</span>
        </button>
      </div>
    </aside>
  );
}
