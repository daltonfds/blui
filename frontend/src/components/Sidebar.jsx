import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
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


const traducoesEN = {
  PAINEL: 'DASHBOARD',
  'Visão geral': 'Overview',
  Funil: 'Funnel',
  Receita: 'Revenue',
  Oportunidades: 'Opportunities',
  NÚMEROS: 'NUMBERS',
  'Ler números de imagens': 'Read numbers from images',
  CONTACTOS: 'CONTACTS',
  Todos: 'All',
  Clientes: 'Customers',
  Segmentos: 'Segments',
  Etiquetas: 'Tags',
  CONVERSAS: 'CONVERSATIONS',
  PRODUTOS: 'PRODUCTS',
  Categorias: 'Categories',
  'Base do agente': 'Agent knowledge base',
  LOJA: 'STORE',
  Pedidos: 'Orders',
  Carrinhos: 'Carts',
  SITES: 'SITES',
  'Páginas de venda': 'Sales pages',
  Formulários: 'Forms',
  Domínios: 'Domains',
  CAMPANHAS: 'CAMPAIGNS',
  Anúncios: 'Ads',
  Públicos: 'Audiences',
  Resultados: 'Results',
  AUTOMAÇÕES: 'AUTOMATIONS',
  'Carrinho abandonado': 'Abandoned cart',
  'Checkout abandonado': 'Abandoned checkout',
  'Pós-venda': 'Post-purchase',
  Reativação: 'Reactivation',
  DEFINIÇÕES: 'SETTINGS',
  'Minha conta': 'My account',
  Negócio: 'Business',
  Agente: 'Agent',
  Canais: 'Channels',
  Pagamentos: 'Payments',
  Entregas: 'Delivery',
  Segurança: 'Security',
  CONTA: 'ACCOUNT',
  Assinatura: 'Subscription',
  Suporte: 'Support',
  Admin: 'Admin',
  'Terminar sessão': 'Sign out',
};

function traduzir(texto, idioma) {
  if (idioma !== 'en') return texto;
  return traducoesEN[texto] || texto;
}

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
      { to: '/definicoes/whatsapp', label: 'WhatsApp', Icon: IconSettings },
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
  const location = useLocation();
  const [abertos, setAbertos] = useState(() => new Set());
  const [idioma, setIdioma] = useState(() => {
    const salvo = localStorage.getItem('blui-language');
    return salvo === 'en' ? 'en' : 'pt';
  });

  useEffect(() => {
    document.documentElement.lang = idioma === 'en' ? 'en' : 'pt-PT';
    localStorage.setItem('blui-language', idioma);
  }, [idioma]);

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

      <nav className="flex-1 space-y-3">
        {grupos.map((grupo) => {
          const ativo = grupo.itens.some((item) =>
            location.pathname === item.to ||
            (item.to !== '/painel' && item.to !== '/contactos' && item.to !== '/conversas' &&
             item.to !== '/produtos' && item.to !== '/loja' && item.to !== '/sites' &&
             item.to !== '/campanhas' && item.to !== '/automacoes' && item.to !== '/definicoes' &&
             location.pathname.startsWith(item.to + '/'))
          );
          const aberto = abertos.has(grupo.titulo) || ativo;
          return (
            <section key={grupo.titulo}>
              <button
                type="button"
                onClick={() => setAbertos(prev => {
                  const n = new Set(prev);
                  n.has(grupo.titulo) ? n.delete(grupo.titulo) : n.add(grupo.titulo);
                  return n;
                })}
                className="w-full flex items-center justify-between px-3 mb-1.5 text-left text-[10px] font-bold tracking-[0.14em] text-base-ink/40 hover:text-base-ink"
              >
                <span className="flex items-center gap-2">{grupo.titulo === 'PAINEL' && <IconGrid />}{grupo.titulo === 'NÚMEROS' && <IconLayers />}{grupo.titulo === 'CONTACTOS' && <IconPeople />}{grupo.titulo === 'CONVERSAS' && <IconPeople />}{grupo.titulo === 'PRODUTOS' && <IconLayers />}{grupo.titulo === 'LOJA' && <IconLayers />}{grupo.titulo === 'SITES' && <IconLayers />}{grupo.titulo === 'CAMPANHAS' && <IconBolt />}{grupo.titulo === 'AUTOMAÇÕES' && <IconBolt />}{grupo.titulo === 'DEFINIÇÕES' && <IconSettings />}{traduzir(grupo.titulo, idioma)}</span>
                <span className={`transition-transform ${aberto ? 'rotate-180' : ''}`}>⌄</span>
              </button>
              {aberto && (
                <div className="space-y-0.5">
                  {grupo.itens.map((item) => (
                    <Item key={item.to} {...item} label={traduzir(item.label, idioma)} />
                  ))}
                </div>
              )}
            </section>
          );
        })}
        <section>
          <div className="px-3 mb-1.5 text-[10px] font-bold tracking-[0.14em] text-base-ink/40">
            {traduzir('CONTA', idioma)}
          </div>
          <Item to="/assinatura" label={traduzir("Assinatura", idioma)} Icon={IconSettings} />
          <Item to="/suporte" label={traduzir("Suporte", idioma)} Icon={IconPeople} />
          {ehAdmin && <Item to="/admin" label={traduzir("Admin", idioma)} Icon={IconBolt} />}
        </section>
      </nav>

      <div className="px-3 py-3 border-t border-black/5">
        <div className="mb-2 text-[10px] font-bold tracking-[0.14em] text-base-ink/40">
          IDIOMA / LANGUAGE
        </div>
        <div className="grid grid-cols-2 gap-1 rounded-xs bg-base-fog p-1">
          <button
            type="button"
            onClick={() => setIdioma('pt')}
            className={`rounded-xs px-2 py-1.5 text-xs font-semibold transition-colors ${
              idioma === 'pt'
                ? 'bg-base-white text-brand-700 shadow-sm'
                : 'text-base-ink/50 hover:text-base-ink'
            }`}
            aria-pressed={idioma === 'pt'}
          >
            Português
          </button>
          <button
            type="button"
            onClick={() => setIdioma('en')}
            className={`rounded-xs px-2 py-1.5 text-xs font-semibold transition-colors ${
              idioma === 'en'
                ? 'bg-base-white text-brand-700 shadow-sm'
                : 'text-base-ink/50 hover:text-base-ink'
            }`}
            aria-pressed={idioma === 'en'}
          >
            English
          </button>
        </div>
      </div>

      <div className="pt-4 mt-4 border-t border-black/5">
        <button
          onClick={terminarSessao}
          className="w-full flex items-center gap-3 rounded-xs px-3 py-2.5 text-sm font-medium text-base-ink/60 hover:bg-base-fog hover:text-signal-red transition-colors"
        >
          <IconLogout />
          <span>{traduzir('Terminar sessão', idioma)}</span>
        </button>
      </div>
    </aside>
  );
}
