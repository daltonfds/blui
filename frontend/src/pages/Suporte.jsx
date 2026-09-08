import React from 'react';
import LayoutApp from '../components/LayoutApp.jsx';

const CONTACTOS = {
  email: 'contact@blui.online',
  whatsapp: '+27722958915',
  instagram: [
    { user: 'velionconsolidate', url: 'https://instagram.com/velionconsolidate' },
    { user: 'dalton_fds', url: 'https://instagram.com/dalton_fds' },
  ],
};

export default function Suporte() {
  return (
    <LayoutApp>
      <h1 className="text-2xl font-semibold text-base-ink mb-1">Suporte</h1>
      <p className="text-sm text-base-ink/55 mb-6">Usa o chatbot (canto inferior direito) ou contacta-nos diretamente.</p>

      <div className="grid sm:grid-cols-3 gap-4">
        <a
          href={`mailto:${CONTACTOS.email}`}
          className="bg-base-white border border-black/5 rounded-xs p-5 hover:border-brand-500 transition-colors"
        >
          <p className="text-sm font-medium text-base-ink">✉️ Email</p>
          <p className="text-sm text-base-ink/60 mt-1">{CONTACTOS.email}</p>
        </a>

        <a
          href={`https://wa.me/${CONTACTOS.whatsapp.replace(/\D/g, '')}`}
          target="_blank" rel="noreferrer"
          className="bg-base-white border border-black/5 rounded-xs p-5 hover:border-brand-500 transition-colors"
        >
          <p className="text-sm font-medium text-base-ink">📞 WhatsApp</p>
          <p className="text-sm text-base-ink/60 mt-1">{CONTACTOS.whatsapp}</p>
        </a>

        <div className="bg-base-white border border-black/5 rounded-xs p-5">
          <p className="text-sm font-medium text-base-ink mb-2">📸 Instagram</p>
          {CONTACTOS.instagram.map((ig) => (
            <a key={ig.user} href={ig.url} target="_blank" rel="noreferrer" className="block text-sm text-brand-600 underline">
              @{ig.user}
            </a>
          ))}
        </div>
      </div>
    </LayoutApp>
  );
}
