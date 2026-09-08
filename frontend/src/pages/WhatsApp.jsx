import React, { useEffect, useState } from 'react';
import LayoutApp from '../components/LayoutApp.jsx';
import { api } from '../lib/api.js';

export default function WhatsApp() {
  const [estado, setEstado] = useState(null);
  const [numero, setNumero] = useState('');
  const [aGuardar, setAGuardar] = useState(false);
  const [mensagem, setMensagem] = useState('');

  async function carregar() {
    try {
      const dados = await api.get('/api/twilio/status');
      setEstado(dados);
    } catch (err) {
      setEstado({ erro: err.message });
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function guardar(e) {
    e.preventDefault();
    setAGuardar(true);
    setMensagem('');

    try {
      await api.post('/api/twilio/configurar', {
        whatsapp_from: numero.trim(),
      });

      setMensagem('WhatsApp configurado com sucesso.');
      await carregar();
    } catch (err) {
      setMensagem(err.message || 'Não foi possível configurar o WhatsApp.');
    } finally {
      setAGuardar(false);
    }
  }

  return (
    <LayoutApp>
      <div className="max-w-3xl">
        <h1 className="text-2xl font-semibold text-base-ink">
          WhatsApp
        </h1>

        <p className="mt-1 text-sm text-base-ink/55">
          Liga o WhatsApp deste utilizador ao BLUI.
        </p>

        <div className="mt-8 bg-base-white border border-black/5 rounded-xs p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-medium text-base-ink">
                Estado da ligação
              </h2>

              <p className="mt-1 text-sm text-base-ink/50">
                {estado?.whatsapp
                  ? 'WhatsApp disponível'
                  : 'WhatsApp não configurado'}
              </p>
            </div>

            <span
              className={`px-3 py-1.5 rounded-xs text-xs font-medium ${
                estado?.whatsapp
                  ? 'bg-green-50 text-green-700'
                  : 'bg-base-fog text-base-ink/50'
              }`}
            >
              {estado?.whatsapp ? 'Ligado' : 'Desligado'}
            </span>
          </div>

          <form onSubmit={guardar} className="mt-8 space-y-5">
            <label className="block">
              <span className="text-xs font-medium text-base-ink/60">
                Número WhatsApp
              </span>

              <input
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                placeholder="+258..."
                required
                className="mt-1.5 w-full border border-black/10 rounded-xs px-3.5 py-2.5 text-sm text-base-ink placeholder:text-base-ink/30 focus:border-brand-500 outline-none"
              />

              <span className="block mt-1.5 text-xs text-base-ink/40">
                Usa o número no formato internacional.
              </span>
            </label>

            <button
              type="submit"
              disabled={aGuardar}
              className="bg-brand-500 text-white text-sm font-medium px-5 py-2.5 rounded-xs hover:bg-brand-600 disabled:opacity-50"
            >
              {aGuardar ? 'A guardar…' : 'Ligar WhatsApp'}
            </button>

            {mensagem && (
              <p className="text-sm text-base-ink/60">
                {mensagem}
              </p>
            )}
          </form>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <Info
            titulo="Mensagens"
            texto="Recebe e responde mensagens dos clientes."
          />

          <Info
            titulo="Agente"
            texto="O agente pode responder automaticamente."
          />

          <Info
            titulo="Remarketing"
            texto="Usa os contactos para automações futuras."
          />
        </div>
      </div>
    </LayoutApp>
  );
}

function Info({ titulo, texto }) {
  return (
    <div className="bg-base-white border border-black/5 rounded-xs p-5">
      <h3 className="font-medium text-sm text-base-ink">
        {titulo}
      </h3>
      <p className="mt-2 text-xs leading-5 text-base-ink/50">
        {texto}
      </p>
    </div>
  );
}
