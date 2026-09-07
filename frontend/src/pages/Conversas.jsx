import React, { useEffect, useState } from 'react';
import { api } from '../lib/api.js';

export default function Conversas() {
  const [contactos, setContactos] = useState([]);
  const [selecionado, setSelecionado] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [texto, setTexto] = useState('');

  const carregar = () => api.get('/api/conversas').then(setContactos);

  useEffect(() => { carregar(); }, []);

  async function abrir(c) {
    setSelecionado(c);
    setMensagens(await api.get(`/api/conversas/${c.id}/mensagens`));
  }

  async function enviar(e) {
    e.preventDefault();
    if (!texto.trim() || !selecionado) return;

    await api.post(`/api/conversas/${selecionado.id}/mensagens`, { conteudo: texto });
    setTexto('');
    abrir(selecionado);
  }

  return (
    <div className="min-h-screen bg-base-fog p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-semibold">Conversas</h1>
        <p className="mt-2 text-sm text-base-ink/60">Central de conversas e atendimento.</p>

        <div className="mt-8 grid min-h-[600px] overflow-hidden rounded-xl border border-black/5 bg-base-white md:grid-cols-[320px_1fr]">
          <div className="border-r border-black/5">
            {contactos.map(c => (
              <button key={c.id} onClick={() => abrir(c)}
                className="w-full border-b border-black/5 p-4 text-left hover:bg-base-fog">
                <div className="font-medium">{c.nome || c.numero || 'Contacto'}</div>
                <div className="mt-1 text-xs text-base-ink/50">{c.estado || 'novo'}</div>
              </button>
            ))}
            {!contactos.length && <div className="p-6 text-sm text-base-ink/50">Ainda não existem conversas.</div>}
          </div>

          <div className="flex flex-col">
            <div className="flex-1 space-y-3 overflow-y-auto p-6">
              {!selecionado && <div className="text-sm text-base-ink/50">Seleciona uma conversa.</div>}
              {mensagens.map(m => (
                <div key={m.id} className={`max-w-[80%] rounded-xl p-3 text-sm ${m.remetente === 'utilizador' ? 'ml-auto bg-brand-100' : 'bg-base-fog'}`}>
                  {m.conteudo}
                </div>
              ))}
            </div>

            {selecionado && (
              <form onSubmit={enviar} className="flex gap-2 border-t border-black/5 p-4">
                <input value={texto} onChange={e => setTexto(e.target.value)}
                  placeholder="Escrever mensagem..."
                  className="flex-1 rounded-lg border border-black/10 px-4 py-3 outline-none" />
                <button className="rounded-lg bg-base-ink px-5 py-3 text-white">Enviar</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
