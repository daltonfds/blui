import React, { useState } from 'react';
import Sidebar from './Sidebar.jsx';
import ChatWidget from './ChatWidget.jsx';

export default function LayoutApp({ children }) {
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <div className="min-h-screen flex bg-base-fog">
      <Sidebar
        open={menuAberto}
        onClose={() => setMenuAberto(false)}
      />

      <main className="flex-1 min-w-0 px-6 md:px-10 py-8 max-w-6xl mx-auto w-full">
        <button
          type="button"
          aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
          onClick={() => setMenuAberto(!menuAberto)}
          className="fixed left-4 top-4 z-[60] flex h-10 w-10 items-center justify-center rounded-xs border border-black/10 bg-base-white text-base-ink shadow-sm hover:bg-base-fog"
        >
          <span className="flex w-5 flex-col gap-1">
            <span className="h-0.5 w-full bg-current" />
            <span className="h-0.5 w-full bg-current" />
            <span className="h-0.5 w-full bg-current" />
          </span>
        </button>

        {children}
      </main>

      <ChatWidget />
    </div>
  );
}
