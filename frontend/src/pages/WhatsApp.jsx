import React, { useEffect, useState } from 'react';
import LayoutApp from '../components/LayoutApp.jsx';
import { api } from '../lib/api.js';

export default function WhatsApp() {
  const [numero, setNumero] = useState('');
  const [estado, setEstado] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  async function carregar() {
    setCarregando(true);
    setErro('');

    try {
      const dados = await api.get('/api/campanhas/contas');
      const conta = Array.isArray(dados) ? dados[0] : dados?.conta;

      if (conta?.whatsapp_phone_number_id) {
        setNumero(conta.whatsapp_phone_number_id);
      }

      setEstado({
        conectado: !!conta?.whatsapp_phone_number_id,
        conta,
      });
    } catch (e) {
      setErro(e.message || 'Não foi possível carregar a configuração do WhatsApp.');
      setEstado({ conectado: false });
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function guardar(e) {
    e.preventDefault();

    setGuardando(true);
    setErro('');
    setSucesso('');

    try {
      await api.post('/api/campanhas/contas', {
        whatsapp_phone_number_id: numero.trim(),
      });

      setSucesso('Número WhatsApp guardado com sucesso.');
      await carregar();
    } catch (e) {
      setErro(e.message || 'Não foi possível guardar o número WhatsApp.');
    } finally {
      setGuardando(false);
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

        <div className="mt-8 rounded-xs border border-black/5 bg-base-white p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-medium text-base-ink">
                Estado da ligação
              </h2>

              <p className="mt-1 text-sm text-base-ink/50">
                {carregando
                  ? 'A verificar…'
                  : estado?.conectado
                    ? 'WhatsApp configurado'
                    : 'WhatsApp não configurado'}
              </p>
            </div>

            <span
              className={`rounded-xs px-3 py-1.5 text-xs font-medium ${
                estado?.conectado
                  ? 'bg-green-50 text-green-700'
                  : 'bg-base-fog text-base-ink/50'
              }`}
            >
              {estado?.conectado ? 'Ligado' : 'Desligado'}
            </span>
          </div>

          <form onSubmit={guardar} className="mt-8 space-y-5">
            <label className="block">
              <span className="text-xs font-medium text-base-ink/60">
                Número WhatsApp
              </span>

              <input
                type="tel"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                placeholder="+258849191742"
                required
                className="mt-1.5 w-full rounded-xs border border-black/10 px-3.5 py-2.5 text-sm text-base-ink outline-none focus:border-brand-500"
              />

              <span className="mt-1.5 block text-xs text-base-ink/40">
                Usa o número no formato internacional.
              </span>
            </label>

            <button
              type="submit"
              disabled={guardando || carregando}
              className="rounded-xs bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
            >
              {guardando ? 'A guardar…' : 'Guardar WhatsApp'}
            </button>

            {erro && (
              <div className="rounded-xs border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {erro}
              </div>
            )}

            {sucesso && (
              <div className="rounded-xs border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {sucesso}
              </div>
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
            texto="Usa os contactos para automações."
          />
        </div>
      </div>
    </LayoutApp>
  );
}

function Info({ titulo, texto }) {
  return (
    <div className="rounded-xs border border-black/5 bg-base-white p-5">
      <h3 className="text-sm font-medium text-base-ink">
        {titulo}
      </h3>

      <p className="mt-2 text-xs leading-5 text-base-ink/50">
        {texto}
      </p>
    </div>
  );
}
