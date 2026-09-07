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
} from './Icons.jsx';

const groups = [
  {
    label: 'PAINEL',
    links: [
      ['/painel', 'Visão geral', IconGrid],
      ['/analytics', 'Analytics', IconGrid],
      ['/suporte', 'Suporte', IconSettings],
    ],
  },
  {
    label: 'CONTACTOS',
    links: [
      ['/contactos', 'Contactos', IconPeople],
    ],
  },
  {
    label: 'CONVERSAS',
    links: [
      ['/conversas', 'Conversas', IconPeople],
    ],
  },
  {
    label: 'PRODUTOS',
    links: [
      ['/produtos', 'Produtos', IconLayers],
    ],
  },
  {
    label: 'LOJA',
    links: [
      ['/loja', 'Loja', IconLayers],
    ],
  },
  {
    label: 'SITES',
    links: [
      ['/sites', 'Sites', IconLayers],
    ],
  },
  {
    label: 'CAMPANHAS',
    links: [
      ['/campanhas', 'Campanhas', IconBolt],
    ],
  },
  {
    label: 'AUTOMAÇÕES',
    links: [
      ['/automacoes', 'Automações', IconBolt],
    ],
  },
  {
    label: 'DEFINIÇÕES',
    links: [
      ['/definicoes', 'Definições', IconSettings],
      ['/numeros', 'Números', IconSettings],
    ],
  },
];

export default function Sidebar() {
  const { sair } = useAuth();
  const navigate = useNavigate();

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
        {groups.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-1.5 text-[10px] font-bold tracking-[0.16em] text-base-ink/35">
              {group.label}
            </p>

            <div className="space-y-0.5">
              {group.links.map(([to, label, Icon]) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-base-ink/65 hover:bg-base-fog hover:text-base-ink'
                    }`
                  }
                >
                  <Icon />
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <button
        onClick={terminarSessao}
        className="mt-5 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-base-ink/60 hover:bg-base-fog hover:text-signal-red transition-colors"
      >
        <IconLogout />
        Terminar sessão
      </button>
    </aside>
  );
}
