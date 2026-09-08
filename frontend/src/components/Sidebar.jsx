import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { supabase } from '../lib/supabaseClient.js';
import Wordmark from './Wordmark.jsx';
import { IconGrid, IconPeople, IconLayers, IconBolt, IconSettings, IconLogout } from './Icons.jsx';

const links = [
  { to: '/painel', label: 'Painel', Icon: IconGrid },
  { to: '/contactos', label: 'Contactos', Icon: IconPeople },
  { to: '/produtos', label: 'Produtos', Icon: IconLayers },
  { to: '/campanhas', label: 'Campanhas', Icon: IconBolt },
  { to: '/numeros', label: 'Números', Icon: IconLayers },
  { to: '/assinatura', label: 'Assinatura', Icon: IconSettings },
  { to: '/suporte', label: 'Suporte', Icon: IconPeople },
  { to: '/definicoes', label: 'Definições', Icon: IconSettings },
];

export default function Sidebar() {
  const { sair } = useAuth();
  const navigate = useNavigate();
  const [ehAdmin, setEhAdmin] = useState(false);

  useEffect(() => {
    supabase.rpc('is_admin').then(({ data }) => setEhAdmin(!!data));
  }, []);

  async function terminarSessao() {
    await sair();
    navigate('/entrar');
  }

  return (
    <aside className="hidden md:flex md:flex-col w-60 shrink-0 border-r border-black/5 bg-base-white px-4 py-6">
      <div className="px-2 mb-8">
        <Wordmark />
      </div>

      <nav className="flex-1 space-y-1">
        {links.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xs px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? 'bg-brand-50 text-brand-700' : 'text-base-ink/70 hover:bg-base-fog hover:text-base-ink'
              }`
            }
          >
            <Icon />
            {label}
          </NavLink>
        ))}

        {ehAdmin && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xs px-3 py-2.5 text-sm font-medium transition-colors border-t border-black/5 mt-2 pt-3 ${
                isActive ? 'bg-brand-50 text-brand-700' : 'text-base-ink/70 hover:bg-base-fog hover:text-base-ink'
              }`
            }
          >
            <IconBolt />
            Admin
          </NavLink>
        )}
      </nav>

      <button
        onClick={terminarSessao}
        className="flex items-center gap-3 rounded-xs px-3 py-2.5 text-sm font-medium text-base-ink/60 hover:bg-base-fog hover:text-signal-red transition-colors"
      >
        <IconLogout />
        Terminar sessão
      </button>
    </aside>
  );
}
