import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import ChatWidget from './ChatWidget.jsx';
import NavigationBar from './NavigationBar.jsx';

export default function LayoutApp({ children }) {
  const [menuAberto, setMenuAberto] = useState(false);
  const location = useLocation();

  return (
    <div className="blui-app min-h-screen bg-[#f7f9fc] text-slate-900">

      <Sidebar
        open={menuAberto}
        onClose={() => setMenuAberto(false)}
      />

      <main className="blui-main min-h-screen lg:pl-[248px]">

        <header className="blui-topbar">

          <button
            type="button"
            aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
            onClick={() => setMenuAberto(!menuAberto)}
            className="blui-menu-button"
          >
            <span />
            <span />
            <span />
          </button>

          <NavigationBar />

          <div className="blui-topbar-inner">
            <div className="blui-topbar-title">
              <strong>BLUI</strong>
              <small>Workspace</small>
            </div>

            <div className="blui-topbar-status">
              <i />
              <span>Operacional</span>
            </div>
          </div>

        </header>

        <div className="blui-content">
          <div className="blui-content-inner">

            <div
              key={location.key}
              className="blui-route-transition"
            >
              {children}
            </div>

          </div>
        </div>

      </main>

      <ChatWidget />

    </div>
  );
}
