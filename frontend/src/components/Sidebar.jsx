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

const itens = [
  { to: '/painel', label: 'Painel', Icon: IconGrid },
  { to: '/conversas', label: 'Conversas', Icon: IconPeople },
  { to: '/contactos', label: 'Contactos', Icon: IconPeople },
  { to: '/remarketing', label: 'Remarketing', Icon: IconBolt },
  { to: '/funil', label: 'Funil', Icon: IconLayers },
  { to: '/treino', label: 'Treino do chatbot', Icon: IconSettings },
  { to: '/numeros', label: 'Números', Icon: IconLayers },
];

export default function Sidebar() {
  const { sair } = useAuth();
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    let ativo = true;
    supabase.rpc('is_admin').then(({ data }) => {
      if (ativo) setAdmin(Boolean(data));
    });
    return () => { ativo = false; };
  }, []);

  async function terminarSessao() {
    await sair();
    navigate('/entrar');
  }

  return (
    <aside className="hidden md:flex md:flex-col w-64 shrink-0 border-r border-black/5 bg-base-white px-3 py-5">
      <div className="px-3 mb-7">
        <Wordmark />
        <p className="mt-2 text-xs text-base-ink/40">Versão 0.5</p>
      </div>

      <nav className="flex-1 space-y-1">
        {itens.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xs px-3 py-2.5 text-sm font-medium transition-colors ${
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

        <div className="pt-6">
          <p className="px-3 mb-2 text-[10px] font-bold tracking-[0.14em] text-base-ink/35">
            CONTA
          </p>

          <NavLink
            to="/assinatura"
            className="flex items-center gap-3 rounded-xs px-3 py-2.5 text-sm font-medium text-base-ink/65 hover:bg-base-fog"
          >
            <IconSettings />
            <span>Assinatura</span>
          </NavLink>

          <NavLink
            to="/suporte"
            className="flex items-center gap-3 rounded-xs px-3 py-2.5 text-sm font-medium text-base-ink/65 hover:bg-base-fog"
          >
            <IconPeople />
            <span>Suporte</span>
          </NavLink>

          {admin && (
            <NavLink
              to="/admin"
              className="flex items-center gap-3 rounded-xs px-3 py-2.5 text-sm font-medium text-base-ink/65 hover:bg-base-fog"
            >
              <IconSettings />
              <span>Administração</span>
            </NavLink>
          )}
        </div>
      </nav>

      <button
        onClick={terminarSessao}
        className="mt-4 border-t border-black/5 pt-4 w-full flex items-center gap-3 rounded-xs px-3 py-2.5 text-sm font-medium text-base-ink/60 hover:bg-base-fog"
      >
        <IconLogout />
        <span>Terminar sessão</span>
      </button>
    </aside>
  );
}
