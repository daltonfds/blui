import React, { useEffect, useRef, useState } from 'react';
import LayoutApp from '../components/LayoutApp.jsx';
import { api } from '../lib/api.js';

const VAZIO = {
  phone_number: '',
  display_name: '',
  waba_id: '',
  sender_sid: '',
  twilio_subaccount_sid: '',
  status: 'disconnected',
};

export default function WhatsApp() {
  const [form, setForm] = useState(VAZIO);
  const [carregando, setCarregando] = useState(true);
  const [conectando, setConectando] = useState(false);
  const [verificando, setVerificando] = useState(false);
  const [desligando, setDesligando] = useState(false);
  const [otp, setOtp] = useState('');
  const [mostrarOtp, setMostrarOtp] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [metaReady, setMetaReady] = useState(false);
  const [metaConfig, setMetaConfig] = useState(null);
  const metaListener = useRef(null);

  async function carregar() {
    setCarregando(true);
    setErro('');

    try {
      const dados = await api.get(
        '/api/twilio/whatsapp/connection'
      );

      setForm({
        ...VAZIO,
        ...(dados.connection || {}),
      });

      setMetaReady(
        Boolean(
          dados.meta?.ready ||
          (
            import.meta.env.VITE_META_APP_ID &&
            import.meta.env.VITE_META_CONFIG_ID
          )
        )
      );

      setMetaConfig({
        appId:
          dados.meta?.appId ||
          import.meta.env.VITE_META_APP_ID ||
          '',
        configId:
          dados.meta?.configId ||
          import.meta.env.VITE_META_CONFIG_ID ||
          '',
      });
    } catch (e) {
      setErro(
        e.message ||
        'Não foi possível carregar o WhatsApp.'
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();

    return () => {
      if (metaListener.current) {
        window.removeEventListener(
          'message',
          metaListener.current
        );
      }
    };
  }, []);

  function alterar(campo, valor) {
    setForm((atual) => ({
      ...atual,
      [campo]: valor,
    }));
    setErro('');
    setSucesso('');
  }

  async function carregarFacebookSDK() {
    if (window.FB) return;

    await new Promise((resolve, reject) => {
      const existente =
        document.getElementById(
          'facebook-jssdk'
        );

      if (existente) {
        const timer = setInterval(() => {
          if (window.FB) {
            clearInterval(timer);
            resolve();
          }
        }, 100);

        setTimeout(() => {
          clearInterval(timer);
          reject(
            new Error(
              'Facebook SDK não ficou disponível.'
            )
          );
        }, 10000);

        return;
      }

      window.fbAsyncInit = () => {
        window.FB.init({
          appId:
            metaConfig?.appId ||
            import.meta.env.VITE_META_APP_ID,
          cookie: true,
          xfbml: true,
          version:
            import.meta.env.VITE_META_GRAPH_VERSION ||
            'v24.0',
        });

        resolve();
      };

      const script =
        document.createElement('script');

      script.id =
        'facebook-jssdk';

      script.src =
        'https://connect.facebook.net/en_US/sdk.js';

      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';

      script.onerror = () =>
        reject(
          new Error(
            'Não foi possível carregar o Facebook SDK.'
          )
        );

      document.body.appendChild(script);
    });
  }

  async function conectar() {
    setConectando(true);
    setErro('');
    setSucesso('');

    try {
      if (!/^\+\d{8,15}$/.test(
        form.phone_number.trim()
      )) {
        throw new Error(
          'Indica o número no formato internacional, por exemplo +258XXXXXXXXX.'
        );
      }

      const inicio =
        await api.post(
          '/api/twilio/whatsapp/onboarding/start',
          {
            phoneNumber:
              form.phone_number.trim(),
            displayName:
              form.display_name.trim() ||
              'BLUI',
          }
        );

      setForm((atual) => ({
        ...atual,
        ...(inicio.connection || {}),
      }));

      const appId =
        inicio.meta?.appId ||
        metaConfig?.appId ||
        import.meta.env.VITE_META_APP_ID;

      const configId =
        inicio.meta?.configId ||
        metaConfig?.configId ||
        import.meta.env.VITE_META_CONFIG_ID;

      if (!appId || !configId) {
        throw new Error(
          'O Embedded Signup ainda não está configurado no BLUI. Define META_APP_ID, META_EMBEDDED_SIGNUP_CONFIG_ID e as variáveis VITE correspondentes.'
        );
      }

      await carregarFacebookSDK();

      if (metaListener.current) {
        window.removeEventListener(
          'message',
          metaListener.current
        );
      }

      metaListener.current =
        async (event) => {
          if (
            !event.origin.includes(
              'facebook.com'
            )
          ) {
            return;
          }

          let data = event.data;

          try {
            if (
              typeof data === 'string'
            ) {
              data = JSON.parse(data);
            }
          } catch {
            return;
          }

          if (
            data?.type !==
            'WA_EMBEDDED_SIGNUP'
          ) {
            return;
          }

          const wabaId =
            data?.data?.waba_id ||
            data?.waba_id;

          if (!wabaId) {
            setErro(
              'A Meta terminou o fluxo mas não devolveu o WABA ID.'
            );
            return;
          }

          try {
            const finalizado =
              await api.post(
                '/api/twilio/whatsapp/onboarding/complete',
                {
                  phoneNumber:
                    form.phone_number.trim(),
                  displayName:
                    form.display_name.trim() ||
                    'BLUI',
                  wabaId,
                }
              );

            setForm((atual) => ({
              ...atual,
              ...(finalizado.connection || {}),
            }));

            setSucesso(
              finalizado.connected
                ? 'WhatsApp conectado com sucesso.'
                : 'WhatsApp registado. Aguarda a verificação do sender e confirma o estado.'
            );

            if (
              finalizado.connection?.status !==
              'connected'
            ) {
              setMostrarOtp(true);
            }
          } catch (e) {
            setErro(
              e.message ||
              'Não foi possível finalizar o WhatsApp.'
            );
          } finally {
            setConectando(false);
          }
        };

      window.addEventListener(
        'message',
        metaListener.current
      );

      window.FB.login(
        () => {},
        {
          config_id:
            configId,
          response_type:
            'code',
          override_default_response_type:
            true,
          extras: {
            setup: {},
          },
        }
      );
    } catch (e) {
      setErro(
        e.message ||
        'Não foi possível iniciar a conexão WhatsApp.'
      );
      setConectando(false);
    }
  }

  async function verificar() {
    setVerificando(true);
    setErro('');
    setSucesso('');

    try {
      const dados =
        await api.post(
          '/api/twilio/whatsapp/connection/verificar',
          {}
        );

      setForm((atual) => ({
        ...atual,
        ...(dados.connection || {}),
      }));

      if (dados.connected) {
        setSucesso(
          'WhatsApp conectado e operacional.'
        );
        setMostrarOtp(false);
      } else {
        setSucesso(
          'A conexão ainda está em processamento.'
        );
      }
    } catch (e) {
      setErro(
        e.message ||
        'Não foi possível verificar a conexão.'
      );
    } finally {
      setVerificando(false);
    }
  }

  async function validarOtp(e) {
    e.preventDefault();

    setVerificando(true);
    setErro('');
    setSucesso('');

    try {
      const dados =
        await api.post(
          '/api/twilio/whatsapp/connection/otp',
          {
            otp:
              otp.trim(),
          }
        );

      setForm((atual) => ({
        ...atual,
        ...(dados.connection || {}),
      }));

      if (dados.connected) {
        setMostrarOtp(false);
        setOtp('');
        setSucesso(
          'WhatsApp verificado e conectado.'
        );
      } else {
        setSucesso(
          'Código recebido. O sender continua em processamento.'
        );
      }
    } catch (e) {
      setErro(
        e.message ||
        'Código OTP inválido ou expirado.'
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
        '/api/twilio/whatsapp/connection'
      );

      setForm(VAZIO);
      setMostrarOtp(false);

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
    form.status === 'connected';

  const pendente =
    form.status === 'connecting' ||
    form.status === 'pending';

  return (
    <LayoutApp>
      <div className="max-w-4xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-base-ink">
              WhatsApp
            </h1>

            <p className="mt-1 max-w-2xl text-sm text-base-ink/55">
              Liga o teu próprio WhatsApp ao BLUI.
              O chatbot, contactos, conversas e automações
              passam a funcionar neste número.
            </p>
          </div>

          <Estado
            carregando={carregando}
            conectado={conectado}
            pendente={pendente}
          />
        </div>

        <div className="mt-8 space-y-5">
          {!conectado && (
            <section className="rounded-xs border border-black/5 bg-base-white p-6">
              <h2 className="font-medium text-base-ink">
                Conectar WhatsApp
              </h2>

              <p className="mt-1 text-sm text-base-ink/50">
                Não precisas de WABA ID, Sender SID,
                Subaccount SID ou credenciais Twilio.
                O BLUI trata desses dados no backend.
              </p>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <Campo
                  label="Número WhatsApp"
                  value={form.phone_number}
                  onChange={(valor) =>
                    alterar(
                      'phone_number',
                      valor
                    )
                  }
                  placeholder="+258..."
                  type="tel"
                  ajuda="Usa o formato internacional."
                />

                <Campo
                  label="Nome comercial"
                  value={form.display_name}
                  onChange={(valor) =>
                    alterar(
                      'display_name',
                      valor
                    )
                  }
                  placeholder="Nome da empresa"
                />
              </div>

              <div className="mt-6 rounded-xs border border-blue-100 bg-blue-50/40 p-4 text-sm text-base-ink/70">
                Depois de continuar, a Meta abre o
                processo oficial de WhatsApp Business.
                O utilizador escolhe a empresa, WABA e
                confirma o número.
              </div>

              <button
                type="button"
                onClick={conectar}
                disabled={
                  conectando ||
                  carregando ||
                  !form.phone_number.trim() ||
                  !metaReady
                }
                className="mt-6 rounded-xs bg-brand-500 px-6 py-3 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
              >
                {conectando
                  ? 'A conectar…'
                  : 'Conectar WhatsApp'}
              </button>

              {!metaReady && (
                <p className="mt-3 text-xs text-red-600">
                  Embedded Signup ainda não configurado no ambiente.
                </p>
              )}
            </section>
          )}

          {conectado && (
            <section className="rounded-xs border border-green-200 bg-base-white p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-green-700">
                    WhatsApp conectado
                  </p>

                  <h2 className="mt-2 text-xl font-semibold text-base-ink">
                    {form.phone_number}
                  </h2>

                  <p className="mt-1 text-sm text-base-ink/50">
                    {form.display_name || 'WhatsApp Business'}
                  </p>
                </div>

                <span className="rounded-xs bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
                  Ativo
                </span>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <Status titulo="Chatbot" ativo />
                <Status titulo="Webhook" ativo />
                <Status titulo="WhatsApp" ativo />
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={verificar}
                  disabled={verificando}
                  className="rounded-xs border border-black/10 px-5 py-2.5 text-sm font-medium text-base-ink hover:bg-base-fog disabled:opacity-50"
                >
                  {verificando
                    ? 'A verificar…'
                    : 'Testar conexão'}
                </button>

                <button
                  type="button"
                  onClick={desligar}
                  disabled={desligando}
                  className="rounded-xs border border-red-200 px-5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  {desligando
                    ? 'A desligar…'
                    : 'Desconectar'}
                </button>
              </div>
            </section>
          )}

          {mostrarOtp && (
            <section className="rounded-xs border border-blue-100 bg-base-white p-6">
              <h2 className="font-medium text-base-ink">
                Verificação do número
              </h2>

              <p className="mt-1 text-sm text-base-ink/50">
                Introduz o código enviado pela Meta
                para o número WhatsApp.
              </p>

              <form
                onSubmit={validarOtp}
                className="mt-5 flex flex-col gap-3 sm:flex-row"
              >
                <input
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value)
                  }
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="Código"
                  className="w-full rounded-xs border border-blue-500 px-4 py-3 text-sm outline-none focus:border-blue-700 sm:max-w-xs"
                />

                <button
                  type="submit"
                  disabled={
                    verificando ||
                    !otp.trim()
                  }
                  className="rounded-xs bg-brand-500 px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
                >
                  Confirmar código
                </button>
              </form>
            </section>
          )}

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

          <section className="rounded-xs border border-black/5 bg-base-white p-6">
            <h2 className="font-medium text-base-ink">
              Fluxo da integração
            </h2>

            <div className="mt-5 grid gap-3 sm:grid-cols-4">
              <Etapa
                numero="01"
                titulo="BLUI"
                texto="Inicia a conexão e cria o ambiente do utilizador."
              />

              <Etapa
                numero="02"
                titulo="Meta"
                texto="O utilizador confirma a empresa e WhatsApp Business."
              />

              <Etapa
                numero="03"
                titulo="Twilio"
                texto="O BLUI regista automaticamente o WhatsApp Sender."
              />

              <Etapa
                numero="04"
                titulo="Chatbot"
                texto="Mensagens, contactos, funil e automações ficam ativos."
              />
            </div>
          </section>

          <section className="rounded-xs border border-black/5 bg-base-white p-6">
            <h2 className="font-medium text-base-ink">
              Webhook
            </h2>

            <div className="mt-4 rounded-xs border border-black/10 bg-base-fog px-4 py-3">
              <code className="break-all text-xs text-base-ink/70">
                https://blui-backend.onrender.com/api/twilio/webhook
              </code>
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
        className="mt-1.5 w-full rounded-xs border border-blue-500 px-3.5 py-2.5 text-sm text-base-ink outline-none focus:border-blue-700"
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
  let texto = 'Não conectado';
  let classe =
    'bg-base-fog text-base-ink/50';

  if (carregando) {
    texto = 'A verificar…';
  } else if (conectado) {
    texto = 'Conectado';
    classe =
      'bg-green-50 text-green-700';
  } else if (pendente) {
    texto = 'A verificar';
    classe =
      'bg-yellow-50 text-yellow-700';
  }

  return (
    <span
      className={`w-fit rounded-xs px-3 py-1.5 text-xs font-medium ${classe}`}
    >
      {texto}
    </span>
  );
}

function Status({
  titulo,
  ativo,
}) {
  return (
    <div className="rounded-xs border border-black/5 bg-base-fog/50 p-4">
      <p className="text-sm font-medium text-base-ink">
        {titulo}
      </p>

      <p
        className={`mt-1 text-xs ${
          ativo
            ? 'text-green-700'
            : 'text-base-ink/40'
        }`}
      >
        {ativo
          ? 'Ativo'
          : 'A aguardar'}
      </p>
    </div>
  );
}

function Etapa({
  numero,
  titulo,
  texto,
}) {
  return (
    <div className="rounded-xs border border-black/5 p-4">
      <span className="text-xs font-medium text-brand-500">
        {numero}
      </span>

      <p className="mt-2 text-sm font-medium text-base-ink">
        {titulo}
      </p>

      <p className="mt-1 text-xs leading-5 text-base-ink/45">
        {texto}
      </p>
    </div>
  );
}
