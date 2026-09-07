import React, { useState } from 'react';
import Sidebar from './Sidebar.jsx';
import { IconLogout } from './Icons.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function LayoutApp({ children }) {
  const [menuAberto, setMenuAberto] = useState(false);
  const { sair } = useAuth();

  async function terminarSessao() {
    await sair();
    window.location.href = '/entrar';
  }

  return (
    <div className="min-h-screen bg-base-fog text-base-ink">
      <Sidebar mobileOpen={menuAberto} onClose={() => setMenuAberto(false)} />

      <div className="md:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-black/5 bg-base-white/95 px-4 backdrop-blur md:px-8">
          <button
            type="button"
            onClick={() => setMenuAberto(true)}
            className="rounded-lg p-2 text-base-ink/60 hover:bg-base-fog md:hidden"
            aria-label="Abrir menu"
          >
            ☰
          </button>

          <div className="hidden text-sm font-medium text-base-ink/50 md:block">
            BLUI
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="hidden rounded-lg px-3 py-2 text-sm text-base-ink/50 hover:bg-base-fog sm:block"
            >
              Pesquisa
            </button>

            <button
              type="button"
              className="rounded-lg px-3 py-2 text-sm text-base-ink/50 hover:bg-base-fog"
              aria-label="Notificações"
            >
              🔔
            </button>

            <button
              type="button"
              onClick={terminarSessao}
              className="rounded-lg p-2 text-base-ink/50 hover:bg-base-fog hover:text-red-600 md:hidden"
              aria-label="Terminar sessão"
            >
              <IconLogout />
            </button>
          </div>
        </header>

        <main className="min-h-[calc(100vh-4rem)] px-4 py-6 md:px-8 md:py-8">
          <div className="mx-auto w-full max-w-[1400px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
