import React, { useEffect, useState } from 'react';
import { api } from '../lib/api.js';

export default function Suporte() {
  const [tickets, setTickets] = useState([]);
  const [problema, setProblema] = useState('');

  const carregar = () => api.get('/api/suporte/tickets').then(setTickets);

  useEffect(() => {
    carregar();
  }, []);

  async function enviar(e) {
    e.preventDefault();
    if (!problema.trim()) return;

    await api.post('/api/suporte/tickets', {
      assunto: 'Pedido de suporte',
      problema,
      categoria: 'other',
    });

    setProblema('');
    carregar();
  }

  return (
    <div className="min-h-screen bg-base-fog p-6 md:p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-semibold">Suporte</h1>
        <p className="mt-2 text-sm text-base-ink/60">
          Estamos disponíveis para ajudar.
        </p>

        <div className="mt-6 rounded-xl bg-base-white p-6 shadow-sm">
          <div className="text-sm">
            <strong>Email:</strong> contact@blui.online
          </div>

          <div className="mt-2 text-sm">
            <strong>WhatsApp:</strong> +27 72 295 8915
          </div>

          <div className="mt-2 text-sm">
            <strong>Instagram:</strong> velionconsolidate · dalton_fds
          </div>
        </div>

        <form
          onSubmit={enviar}
          className="mt-6 rounded-xl bg-base-white p-6 shadow-sm"
        >
          <textarea
            value={problema}
            onChange={(e) => setProblema(e.target.value)}
            placeholder="Descreve o problema. Se disseres que precisas de uma pessoa, o pedido é transferido."
            className="min-h-32 w-full rounded-lg border border-black/10 p-4"
          />

          <button
            type="submit"
            className="mt-3 rounded-lg bg-base-ink px-5 py-3 text-white"
          >
            Falar com suporte
          </button>
        </form>

        <div className="mt-6 space-y-3">
          {tickets.map((t) => (
            <div
              key={t.id}
              className="rounded-xl bg-base-white p-5 shadow-sm"
            >
              <div className="flex justify-between gap-4">
                <strong>{t.assunto}</strong>
                <span className="text-sm">{t.estado}</span>
              </div>

              {t.humano_solicitado && (
                <p className="mt-2 text-sm text-brand-700">
                  Transferido para atendimento humano.
                </p>
              )}
            </div>
          ))}

          {!tickets.length && (
            <div className="rounded-xl bg-base-white p-5 text-sm text-base-ink/50 shadow-sm">
              Ainda não tens pedidos de suporte.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
