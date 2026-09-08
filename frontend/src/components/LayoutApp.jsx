import React from 'react';
import Sidebar from './Sidebar.jsx';
import ChatWidget from './ChatWidget.jsx';

export default function LayoutApp({ children }) {
  return (
    <div className="min-h-screen flex bg-base-fog">
      <Sidebar />
      <main className="flex-1 min-w-0 px-6 md:px-10 py-8 max-w-6xl mx-auto w-full">
        {children}
      </main>
      <ChatWidget />
    </div>
  );
}
