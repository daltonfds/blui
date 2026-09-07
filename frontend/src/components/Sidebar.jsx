import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Wordmark from './Wordmark.jsx';
import {
  IconGrid,
  IconPeople,
  IconLayers,
  IconBolt,
  IconSettings,
  IconLogout,
  IconChat,
} from './Icons.jsx';

const groups = [
  {
    label: 'PAINEL',
    links: [
      ['/painel', 'Visão geral', IconGrid],
      ['/painel/funil', 'Funil', IconGrid],
      ['/painel/receita', 'Receita', IconGrid],
      ['/analytics', 'Analytics', IconGrid],
      ['/painel/oportunidades', 'Oportunidades', IconGrid],
    ],
  },
  {
    label: 'NÚMEROS',
    links: [
      ['/numeros', 'Ler números de imagens', IconLayers],
    ],
  },
  {
    label: 'CONTACTOS',
    links: [
      ['/contactos', 'Todos', IconPeople],
      ['/contactos/leads', 'Leads', IconPeople],
      ['/contactos/clientes', 'Clientes', IconPeople],
      ['/contactos/segmentos', 'Segmentos', IconPeople],
      ['/contactos/etiquetas', 'Etiquetas', IconPeople],
    ],
  },
  {
    label: 'CONVERSAS',
    links: [
      ['/conversas', 'Todas', IconChat],
      ['/conversas/whatsapp', 'WhatsApp', IconChat],
      ['/conversas/instagram', 'Instagram', IconChat],
      ['/conversas/messenger', 'Messenger', IconChat],
      ['/conversas/site', 'Site', IconChat],
    ],
  },
  {
    label: 'PRODUTOS',
    links: [
      ['/produtos', 'Produtos', IconLayers],
      ['/produtos/categorias', 'Categorias', IconLayers],
      ['/produtos/faq', 'FAQ', IconLayers],
      ['/produtos/agente', 'Base do agente', IconLayers],
    ],
  },
  {
    label: 'LOJA',
    links: [
      ['/loja', 'Loja', IconLayers],
      ['/loja/produtos', 'Produtos', IconLayers],
      ['/loja/pedidos', 'Pedidos', IconLayers],
      ['/loja/carrinhos', 'Carrinhos', IconLayers],
      ['/loja/checkout', 'Checkout', IconLayers],
    ],
  },
  {
    label: 'SITES',
    links: [
      ['/sites', 'Landing pages', IconLayers],
      ['/sites/vendas', 'Páginas de venda', IconLayers],
      ['/sites/formularios', 'Formulários', IconLayers],
      ['/sites/dominios', 'Domínios', IconLayers],
    ],
  },
  {
    label: 'CAMPANHAS',
    links: [
      ['/campanhas', 'Anúncios', IconBolt],
      ['/campanhas/publicos', 'Públicos', IconBolt],
      ['/campanhas/remarketing', 'Remarketing', IconBolt],
      ['/campanhas/resultados', 'Resultados', IconBolt],
    ],
  },
  {
    label: 'AUTOMAÇÕES',
    links: [
      ['/automacoes', 'Todas', IconBolt],
      ['/automacoes/remarketing', 'Remarketing', IconBolt],
      ['/automacoes/carrinho-abandonado', 'Carrinho abandonado', IconBolt],
      ['/automacoes/checkout-abandonado', 'Checkout abandonado', IconBolt],
      ['/automacoes/pos-venda', 'Pós-venda', IconBolt],
      ['/automacoes/reativacao', 'Reativação', IconBolt],
    ],
  },
  {
    label: 'DEFINIÇÕES',
    links: [
      ['/definicoes', 'Minha conta', IconSettings],
      ['/definicoes/negocio', 'Negócio', IconSettings],
      ['/definicoes/agente', 'Agente', IconSettings],
      ['/definicoes/canais', 'Canais', IconSettings],
      ['/definicoes/meta', 'Meta', IconSettings],
      ['/definicoes/pagamentos', 'Pagamentos', IconSettings],
      ['/definicoes/entregas', 'Entregas', IconSettings],
      ['/definicoes/automacoes', 'Automações', IconSettings],
      ['/definicoes/seguranca', 'Segurança', IconSettings],
    ],
  },
];

export default function Sidebar({ mobileOpen = false, onClose }) {
  const { sair } = useAuth();
  const navigate = useNavigate();

  async function terminarSessao() {
    await sair();
    navigate('/entrar');
  }

  const menu = (
    <div className="flex h-full flex-col bg-base-white px-3 py-5">
      <div className="mb-6 flex items-center justify-between px-3">
        <Wordmark />

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-base-ink/40 hover:bg-base-fog md:hidden"
          aria-label="Fechar menu"
        >
          ×
        </button>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto pr-1">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="mb-1.5 px-3 text-[10px] font-bold tracking-[0.16em] text-base-ink/35">
              {group.label}
            </p>

            <div className="space-y-0.5">
              {group.links.map(([to, label, Icon]) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-base-ink/65 hover:bg-base-fog hover:text-base-ink'
                    }`
                  }
                >
                  <Icon />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <button
        onClick={terminarSessao}
        className="mt-5 flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-base-ink/60 hover:bg-base-fog hover:text-red-600"
      >
        <IconLogout />
        Terminar sessão
      </button>
    </div>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-black/5 md:block">
        {menu}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/30"
            onClick={onClose}
            aria-label="Fechar menu"
          />

          <aside className="relative h-full w-72 shadow-xl">
            {menu}
          </aside>
        </div>
      )}
    </>
  );
}
