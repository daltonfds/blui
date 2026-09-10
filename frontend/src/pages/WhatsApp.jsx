import React, { useEffect, useState } from 'react';
import LayoutApp from '../components/LayoutApp.jsx';
import { api } from '../lib/api.js';

const VAZIO = {
  phone_number: '',
  display_name: '',
  waba_id: '',
  sender_sid: '',
  twilio_subaccount_sid: '',
  status: 'disconnected',
  provider: 'twilio',
  channel: 'whatsapp',
};

export default function WhatsApp() {
  const [form, setForm] = useState(VAZIO);
  const [carregando, setCarregando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [verificando, setVerificando] = useState(false);
  const [desligando, setDesligando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  async function carregar() {
    setCarregando(true);
    setErro('');

    try {
      const dados = await api.get(
        '/api/integracoes/whatsapp'
      );

      setForm({
        ...VAZIO,
        ...(dados.connection || dados.integracao || {}),
      });
    } catch (e) {
      /*
       * Durante a preparação do backend, o endpoint pode
       * ainda não existir. Nesse caso a interface continua
       * utilizável e será ligada quando o backend estiver pronto.
       */
      setForm(VAZIO);

      if (
        !String(e.message || '').toLowerCase().includes('404')
      ) {
        setErro(
          e.message ||
          'Não foi possível carregar a integração.'
        );
      }
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function alterar(campo, valor) {
    setForm((atual) => ({
      ...atual,
      [campo]: valor,
    }));

    setSucesso('');
    setErro('');
  }

  async function guardar(e) {
    e.preventDefault();

    setGuardando(true);
    setErro('');
    setSucesso('');

    try {
      const payload = {
        phoneNumber: form.phone_number.trim(),
        displayName: form.display_name.trim(),
        wabaId: form.waba_id.trim(),
        senderSid: form.sender_sid.trim(),
        twilioSubaccountSid:
          form.twilio_subaccount_sid.trim(),
      };

      const dados = await api.post(
        '/api/integracoes/whatsapp',
        payload
      );

      setForm((atual) => ({
        ...atual,
        ...(dados.connection || dados.integracao || {}),
        status:
          dados.connection?.status ||
          dados.integracao?.status ||
          'pending',
      }));

      setSucesso(
        'Configuração do WhatsApp guardada.'
      );
    } catch (e) {
      setErro(
        e.message ||
        'Não foi possível guardar a integração.'
      );
    } finally {
      setGuardando(false);
    }
  }

  async function verificar() {
    setVerificando(true);
    setErro('');
    setSucesso('');

    try {
      const dados = await api.post(
        '/api/integracoes/whatsapp/verificar',
        {}
      );

      setForm((atual) => ({
        ...atual,
        ...(dados.connection || dados.integracao || {}),
        status:
          dados.connection?.status ||
          dados.integracao?.status ||
          'connected',
      }));

      setSucesso(
        'Integração do WhatsApp verificada com sucesso.'
      );
    } catch (e) {
      setErro(
        e.message ||
        'Não foi possível verificar a integração.'
      );
    } finally {
      setVerificando(false);
    }
  }

  async function desligar() {
    setDesligando(true);
    setErro('');
    setSucesso('');

    try {
      await api.del(
        '/api/integracoes/whatsapp'
      );

      setForm(VAZIO);

      setSucesso(
        'WhatsApp desligado desta conta BLUI.'
      );
    } catch (e) {
      setErro(
        e.message ||
        'Não foi possível desligar o WhatsApp.'
      );
    } finally {
      setDesligando(false);
    }
  }

  const conectado =
    form.status === 'connected' ||
    form.status === 'active';

  const pendente =
    form.status === 'pending' ||
    form.status === 'connecting';

  const temConfiguracao =
    Boolean(
      form.phone_number ||
      form.waba_id ||
      form.sender_sid ||
      form.twilio_subaccount_sid
    );

  return (
    <LayoutApp>
      <div className="max-w-4xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-base-ink">
              WhatsApp
            </h1>

            <p className="mt-1 max-w-2xl text-sm text-base-ink/55">
              Conecta o WhatsApp deste utilizador ao BLUI.
              Cada conta possui a sua própria integração.
            </p>
          </div>

          <Estado
            carregando={carregando}
            conectado={conectado}
            pendente={pendente}
          />
        </div>

        <div className="mt-8 space-y-5">
          {/* CONEXÃO PRINCIPAL */}
          <section className="rounded-xs border border-black/5 bg-base-white p-6">
            <div>
              <h2 className="font-medium text-base-ink">
                Conexão
              </h2>

              <p className="mt-1 text-sm text-base-ink/50">
                Estes dados identificam a conexão WhatsApp
                deste utilizador.
              </p>
            </div>

            <form
              onSubmit={guardar}
              className="mt-7 space-y-5"
            >
              <div className="grid gap-5 md:grid-cols-2">
                <Campo
                  label="Número WhatsApp"
                  value={form.phone_number}
                  onChange={(valor) =>
                    alterar('phone_number', valor)
                  }
                  placeholder="+258..."
                  type="tel"
                  ajuda="Número no formato internacional."
                />

                <Campo
                  label="Nome do WhatsApp"
                  value={form.display_name}
                  onChange={(valor) =>
                    alterar('display_name', valor)
                  }
                  placeholder="Nome comercial"
                />

                <Campo
                  label="WABA ID"
                  value={form.waba_id}
                  onChange={(valor) =>
                    alterar('waba_id', valor)
                  }
                  placeholder="Será preenchido pelo onboarding"
                  ajuda="Identificador da WhatsApp Business Account."
                />

                <Campo
                  label="Sender SID"
                  value={form.sender_sid}
                  onChange={(valor) =>
                    alterar('sender_sid', valor)
                  }
                  placeholder="Será preenchido pelo Twilio"
                  ajuda="Identificador do WhatsApp Sender."
                />

                <div className="md:col-span-2">
                  <Campo
                    label="Twilio Subaccount SID"
                    value={form.twilio_subaccount_sid}
                    onChange={(valor) =>
                      alterar(
                        'twilio_subaccount_sid',
                        valor
                      )
                    }
                    placeholder="Será criado para este utilizador"
                    ajuda="Cada utilizador terá o seu próprio subaccount."
                  />
                </div>
              </div>

              <div className="rounded-xs border border-black/5 bg-base-fog/50 p-4">
                <div className="flex gap-3">
                  <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" />

                  <div>
                    <p className="text-sm font-medium text-base-ink">
                      Segurança
                    </p>

                    <p className="mt-1 text-xs leading-5 text-base-ink/50">
                      Chaves secretas, Auth Token, API Secret
                      e outras credenciais nunca são guardadas
                      neste formulário nem expostas no navegador.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={
                    guardando ||
                    carregando ||
                    !form.phone_number.trim()
                  }
                  className="rounded-xs bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
                >
                  {guardando
                    ? 'A guardar…'
                    : temConfiguracao
                      ? 'Atualizar integração'
                      : 'Guardar configuração'}
                </button>

                {temConfiguracao && (
                  <button
                    type="button"
                    onClick={verificar}
                    disabled={
                      verificando ||
                      guardando ||
                      carregando
                    }
                    className="rounded-xs border border-black/10 px-5 py-2.5 text-sm font-medium text-base-ink hover:bg-base-fog disabled:opacity-50"
                  >
                    {verificando
                      ? 'A verificar…'
                      : 'Verificar conexão'}
                  </button>
                )}

                {temConfiguracao && (
                  <button
                    type="button"
                    onClick={desligar}
                    disabled={
                      desligando ||
                      carregando
                    }
                    className="rounded-xs border border-red-200 px-5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    {desligando
                      ? 'A desligar…'
                      : 'Desligar'}
                  </button>
                )}
              </div>

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
          </section>

          {/* EMBEDDED SIGNUP */}
          <section className="rounded-xs border border-black/5 bg-base-white p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-medium text-base-ink">
                  Conectar através da Meta
                </h2>

                <p className="mt-1 max-w-2xl text-sm leading-6 text-base-ink/50">
                  Quando o Tech Provider e o Embedded Signup
                  estiverem ativos, este será o ponto de entrada
                  para o utilizador conectar o próprio WhatsApp.
                </p>
              </div>

              <button
                type="button"
                disabled
                className="shrink-0 rounded-xs border border-black/10 px-5 py-2.5 text-sm font-medium text-base-ink/40"
              >
                Conectar WhatsApp
              </button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Etapa
                numero="01"
                titulo="Meta"
                texto="Business Portfolio e WhatsApp Business Account."
              />

              <Etapa
                numero="02"
                titulo="Twilio"
                texto="Subaccount e WhatsApp Sender deste utilizador."
              />

              <Etapa
                numero="03"
                titulo="BLUI"
                texto="Ligação ao agente, contactos e conversas."
              />
            </div>
          </section>

          {/* WEBHOOK */}
          <section className="rounded-xs border border-black/5 bg-base-white p-6">
            <h2 className="font-medium text-base-ink">
              Webhook
            </h2>

            <p className="mt-1 text-sm text-base-ink/50">
              Endpoint que receberá os eventos WhatsApp.
            </p>

            <div className="mt-5">
              <div className="rounded-xs border border-black/10 bg-base-fog px-4 py-3">
                <code className="break-all text-xs text-base-ink/70">
                  https://blui-backend.onrender.com/api/twilio/webhook
                </code>
              </div>

              <p className="mt-2 text-xs text-base-ink/40">
                O backend será responsável por identificar
                automaticamente o utilizador através da conexão.
              </p>
            </div>
          </section>

          {/* STATUS DOS SERVIÇOS */}
          <section className="rounded-xs border border-black/5 bg-base-white p-6">
            <h2 className="font-medium text-base-ink">
              Integração
            </h2>

            <p className="mt-1 text-sm text-base-ink/50">
              Estado dos componentes necessários para o
              WhatsApp multiutilizador.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Status
                titulo="Twilio"
                ativo={Boolean(form.twilio_subaccount_sid)}
              />

              <Status
                titulo="Meta / WABA"
                ativo={Boolean(form.waba_id)}
              />

              <Status
                titulo="WhatsApp Sender"
                ativo={Boolean(form.sender_sid)}
              />

              <Status
                titulo="BLUI"
                ativo={conectado}
              />
            </div>
          </section>
        </div>
      </div>
    </LayoutApp>
  );
}

function Campo({
  label,
  value,
  onChange,
  placeholder,
  ajuda,
  type = 'text',
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-base-ink/60">
        {label}
      </span>

      <input
        type={type}
        value={value || ''}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-xs border border-black/10 px-3.5 py-2.5 text-sm text-base-ink outline-none focus:border-brand-500"
      />

      {ajuda && (
        <span className="mt-1.5 block text-xs text-base-ink/40">
          {ajuda}
        </span>
      )}
    </label>
  );
}

function Estado({
  carregando,
  conectado,
  pendente,
}) {
  let texto = 'Desligado';
  let classe = 'bg-base-fog text-base-ink/50';

  if (carregando) {
    texto = 'A verificar…';
  } else if (conectado) {
    texto = 'Ligado';
    classe = 'bg-green-50 text-green-700';
  } else if (pendente) {
    texto = 'Pendente';
    classe = 'bg-yellow-50 text-yellow-700';
  }

  return (
    <span
      className={`w-fit rounded-xs px-3 py-1.5 text-xs font-medium ${classe}`}
    >
      {texto}
    </span>
  );
}

function Status({ titulo, ativo }) {
  return (
    <div className="rounded-xs border border-black/5 bg-base-fog/40 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-base-ink">
          {titulo}
        </span>

        <span
          className={`h-2 w-2 rounded-full ${
            ativo
              ? 'bg-green-500'
              : 'bg-base-ink/20'
          }`}
        />
      </div>

      <p className="mt-1 text-xs text-base-ink/40">
        {ativo ? 'Configurado' : 'Aguardando'}
      </p>
    </div>
  );
}

function Etapa({ numero, titulo, texto }) {
  return (
    <div className="rounded-xs border border-black/5 bg-base-fog/40 p-4">
      <span className="text-[10px] font-semibold tracking-widest text-brand-500">
        {numero}
      </span>

      <h3 className="mt-2 text-sm font-medium text-base-ink">
        {titulo}
      </h3>

      <p className="mt-1 text-xs leading-5 text-base-ink/45">
        {texto}
      </p>
    </div>
  );
}
