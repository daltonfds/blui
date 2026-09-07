import React, { useEffect, useState } from 'react';
import { api } from '../lib/api.js';

const cards = [
  ['contactos', 'Contactos'],
  ['leads', 'Leads'],
  ['clientes', 'Clientes'],
  ['receita', 'Receita'],
  ['eventos', 'Eventos'],
];

export default function Analytics() {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    api.get('/api/analytics/resumo').then(setDados).catch(e => setErro(e.message));
  }, []);

  if (erro) return <div className="p-8 text-red-600">{erro}</div>;

  return (
    <div className="min-h-screen bg-base-fog p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-semibold uppercase tracking-[.18em] text-brand-600">BLUI</p>
        <h1 className="mt-2 text-3xl font-semibold text-base-ink">Analytics</h1>
        <p className="mt-2 text-sm text-base-ink/60">Visão real da atividade e conversão do teu negócio.</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {cards.map(([key, label]) => (
            <div key={key} className="rounded-xl border border-black/5 bg-base-white p-5 shadow-sm">
              <p className="text-sm text-base-ink/50">{label}</p>
              <p className="mt-2 text-2xl font-semibold">
                {dados ? key === 'receita'
                  ? `R$ ${Number(dados[key] || 0).toFixed(2)}`
                  : dados[key] ?? 0 : '—'}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-xl border border-black/5 bg-base-white p-6 shadow-sm">
          <h2 className="font-semibold">Eventos</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(dados?.porEvento || {}).map(([tipo, total]) => (
              <div key={tipo} className="rounded-lg bg-base-fog p-4">
                <div className="text-sm text-base-ink/50">{tipo}</div>
                <div className="mt-1 text-xl font-semibold">{total}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
