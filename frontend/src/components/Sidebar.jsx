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
  IconChart,
  IconWhatsapp,
} from './Icons.jsx';

const grupos = [
  {
    titulo: 'PRINCIPAL',
    itens: [
      { to: '/painel', label: 'Visão geral', Icon: IconGrid },
      { to: '/conversas', label: 'Conversas', Icon: IconWhatsapp },
      { to: '/contactos', label: 'Contactos', Icon: IconPeople },
    ],
  },
  {
    titulo: 'VENDAS & AUTOMAÇÃO',
    itens: [
      { to: '/remarketing', label: 'Remarketing', Icon: IconBolt },
      { to: '/funil', label: 'Funil', Icon: IconLayers },
      { to: '/treino', label: 'Treino do chatbot', Icon: IconSettings },
    ],
  },
  {
    titulo: 'NEGÓCIO',
    itens: [
      { to: '/produtos', label: 'Produtos', Icon: IconLayers },
      { to: '/numeros', label: 'Números', Icon: IconChart },
    ],
  },
];

export default function Sidebar({ open = false, onClose = () => {} }) {
  const { sessao, sair } = useAuth();
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    let ativo = true;

    if (!sessao?.user?.id) {
      setAdmin(false);
      return () => {
        ativo = false;
      };
    }

    supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', sessao.user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (ativo) setAdmin(!error && Boolean(data?.is_admin));
      });

    return () => {
      ativo = false;
    };
  }, [sessao]);

  async function terminarSessao() {
    await sair();
    navigate('/entrar');
    onClose();
  }

  const linkClass = ({ isActive }) =>
    `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all ${
      isActive
        ? 'bg-blue-50 text-blue-700'
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
    }`;

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/25 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex w-[248px] flex-col
          border-r border-slate-200
          bg-white px-3 py-5
          shadow-xl shadow-slate-900/5
          transition-transform duration-200
          lg:translate-x-0
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between px-3 pb-7">
          <div>
            <Wordmark />

            <p className="mt-1.5 text-[9px] font-semibold tracking-[0.14em] text-slate-400">
              WORKSPACE · V0.5
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-xl text-slate-400 hover:bg-slate-50 lg:hidden"
            aria-label="Fechar menu"
          >
            ×
          </button>
        </div>

        <nav className="min-h-0 flex-1 space-y-6 overflow-y-auto px-1">
          {grupos.map((grupo) => (
            <div key={grupo.titulo}>
              <p className="mb-2 px-3 text-[9px] font-bold tracking-[0.16em] text-slate-400">
                {grupo.titulo}
              </p>

              <div className="space-y-1">
                {grupo.itens.map(({ to, label, Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end
                    onClick={onClose}
                    className={linkClass}
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          className={`
                            flex h-8 w-8 shrink-0 items-center justify-center
                            rounded-lg
                            ${
                              isActive
                                ? 'bg-white shadow-sm'
                                : 'bg-slate-50'
                            }
                          `}
                        >
                          <Icon
                            width="17"
                            height="17"
                          />
                        </span>

                        <span>{label}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-4 border-t border-slate-100 pt-3">
          <NavLink
            to="/assinatura"
            onClick={onClose}
            className={linkClass}
          >
            <IconSettings width="18" height="18" />
            <span>Assinatura</span>
          </NavLink>

          <NavLink
            to="/suporte"
            onClick={onClose}
            className={linkClass}
          >
            <IconPeople width="18" height="18" />
            <span>Suporte</span>
          </NavLink>

          {admin && (
            <NavLink
              to="/admin"
              onClick={onClose}
              className={linkClass}
            >
              <IconSettings width="18" height="18" />
              <span>Administração</span>
            </NavLink>
          )}

          <button
            onClick={terminarSessao}
            className="
              mt-2 flex w-full items-center gap-3
              rounded-xl px-3 py-2.5
              text-[13px] font-medium text-slate-500
              transition-colors
              hover:bg-red-50 hover:text-red-600
            "
          >
            <IconLogout width="18" height="18" />
            <span>Terminar sessão</span>
          </button>
        </div>
      </aside>
    </>
  );
}
