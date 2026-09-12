import React, { useEffect, useState } from 'react';
import LayoutApp from '../components/LayoutApp.jsx';
import { api } from '../lib/api.js';

const PLANOS_FALLBACK = [
  {
    id: 'free-trial',
    nome: 'Teste grátis',
    preco_brl: 0,
    dias_validade: 3,
    mensagens_incluidas: null,
    descricao: '3 dias de teste grátis da BLUI.',
    funcionalidades: [
      '3 dias de acesso',
    ],
  },
  {
    id: '456a2e18-556e-44df-bfd8-25d118e7110e',
    nome: 'Plano de teste de $1',
    preco_brl: 1,
    dias_validade: 7,
    mensagens_incluidas: 20,
    descricao: '7 dias de teste com 20 mensagens, 2 análises de fotos e 24h de remarketing.',
    funcionalidades: [
      '20 mensagens',
      '2 análises de fotos',
      '24h de remarketing',
    ],
  },
  {
    id: '4a66f961-300b-4249-926a-45b5414d365e',
    nome: 'Plano de $9/mês',
    preco_brl: 9,
    dias_validade: 30,
    mensagens_incluidas: null,
    descricao: 'Assinatura mensal da BLUI por $9.',
    funcionalidades: [
      'Assinatura mensal',
    ],
  },
]

export default function Assinatura() {
  const [planos, setPlanos] = useState([]);
  const [minha, setMinha] = useState(null);
  const [aEscolher, setAEscolher] = useState(null);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  async function carregar() {
    setCarregando(true);
    setErro('');

    try {
      const listaPlanos = await api.get('/api/assinaturas/planos');

      setPlanos(
        Array.isArray(listaPlanos) && listaPlanos.length
          ? listaPlanos
          : PLANOS_FALLBACK
      );

      try {
        const assinaturaAtual = await api.get('/api/assinaturas/minha');
        setMinha(assinaturaAtual || null);
      } catch {
        setMinha(null);
      }
    } catch {
      setPlanos(PLANOS_FALLBACK);
      setErro(
        'Não foi possível carregar os planos do servidor. Os planos disponíveis continuam visíveis.'
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function escolher(plano) {
    setAEscolher(plano.id);
    setMensagem('');
    setErro('');

    try {
      await api.post('/api/assinaturas/escolher', {
        planoId: plano.id,
      });

      setMensagem(
        `Pedido do plano ${plano.nome} enviado. Aguarda a aprovação do administrador.`
      );

      await carregar();
    } catch (err) {
      setErro(err.message || 'Não foi possível solicitar este plano.');
    } finally {
      setAEscolher(null);
    }
  }

  const diasRestantes = minha?.ciclo_fim
    ? Math.max(
        0,
        Math.ceil(
          (new Date(minha.ciclo_fim) - new Date()) / 86400000
        )
      )
    : null;

  return (
    <LayoutApp>
      <div className="max-w-7xl mx-auto">

        <h1 className="text-2xl font-semibold text-base-ink mb-1">
          Assinatura
        </h1>

        <p className="text-sm text-base-ink/55 mb-6">
          Escolhe o plano que melhor serve o teu negócio.
        </p>

        {minha && (
          <div className="bg-base-white border border-black/5 rounded-xs p-5 mb-6">
            <p className="text-sm text-base-ink">
              Plano atual:{' '}
              <strong>{minha.planos?.nome || '—'}</strong>
              {' — '}
              estado:{' '}
              <span className="capitalize">
                {minha.estado || '—'}
              </span>

              {diasRestantes !== null &&
                minha.estado === 'ativa' &&
                ` — ${diasRestantes} dia(s) restantes`}
            </p>

            {minha.planos?.mensagens_incluidas != null && (
              <p className="text-xs text-base-ink/50 mt-1">
                Mensagens usadas:{' '}
                {minha.mensagens_usadas || 0}
                {' / '}
                {minha.planos.mensagens_incluidas}
              </p>
            )}
          </div>
        )}

        {erro && (
          <div className="mb-6 rounded-xs border border-signal-red/20 bg-signal-red/5 p-4 text-sm text-signal-red">
            {erro}
          </div>
        )}

        {mensagem && (
          <div className="mb-6 rounded-xs border border-brand-500/20 bg-brand-500/5 p-4 text-sm text-brand-700">
            {mensagem}
          </div>
        )}

        {carregando ? (
          <div className="py-16 text-center text-sm text-base-ink/50">
            A carregar planos…
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">

            {planos.map((p, index) => (
              <div
                key={p.id || index}
                className={`bg-base-white border rounded-xs p-5 flex flex-col ${
                  p.nome === 'Plano de $9/mês'
                    ? 'border-brand-500 ring-1 ring-brand-500/20'
                    : 'border-black/5'
                }`}
              >

                {p.nome === 'Plano de $9/mês' && (
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-brand-600 mb-2">
                    Mais completo
                  </span>
                )}

                {p.nome === 'Teste grátis' && (
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-base-ink/45 mb-2">
                    Teste
                  </span>
                )}

                <h2 className="font-semibold text-base-ink">
                  {p.nome}
                </h2>

                <p className="text-3xl font-bold text-base-ink mt-2">
                  ${Number(p.preco_brl || 0).toFixed(0)}
                </p>

                <p className="text-xs text-base-ink/50 mb-3">
                  {p.dias_validade} dias
                  {' · '}
                  {Number(
                    p.mensagens_incluidas || 0
                  ).toLocaleString('pt-PT')}{' '}
                  mensagens
                </p>

                <p className="text-xs text-base-ink/60 mb-4 flex-1">
                  {p.descricao}
                </p>

                <ul className="text-xs text-base-ink/70 space-y-1 mb-4">
                  {(Array.isArray(p.funcionalidades)
                    ? p.funcionalidades
                    : []
                  ).map((f, i) => (
                    <li key={i}>✓ {f}</li>
                  ))}
                </ul>

                <button
                  onClick={() => escolher(p)}
                  disabled={aEscolher === p.id}
                  className="bg-brand-500 text-base-white text-sm font-medium px-4 py-2.5 rounded-xs hover:bg-brand-600 transition-colors disabled:opacity-50"
                >
                  {aEscolher === p.id
                    ? 'A enviar…'
                    : 'Escolher este plano'}
                </button>

              </div>
            ))}

          </div>
        )}

        <div className="mt-8 text-xs text-base-ink/45">
          O plano Tester custa $1 e é válido por 7 dias.
          Os restantes planos são válidos por 30 dias.
          O acesso é automaticamente bloqueado quando a assinatura expira.
          O plano Pro de $14 dá acesso total à BLUI.
        </div>

      </div>
    </LayoutApp>
  );
}
