import { useEffect, useState } from 'react';
import LayoutApp from '../components/LayoutApp.jsx';
import { api } from '../lib/api.js';

const estados = [
  ['comprou', 'Comprou'],
  ['pendente', 'Pendente'],
  ['nao_respondeu', 'Não respondeu'],
  ['follow_up', 'Follow-up'],
];

export default function Painel() {
  const [resumo, setResumo] = useState(null);
  const [objecoes, setObjecoes] = useState([]);
  const [erro, setErro] = useState('');

  async function carregar() {
    try {
      const [r, o] = await Promise.all([
        api.get('/api/contactos/resumo'),
        api.get('/api/analises/objecoes').catch(() => ({ objecoes: [] })),
      ]);
      setResumo(r);
      setObjecoes(o.objecoes || []);
    } catch (e) {
      setErro(e.message);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  const followUp =
    (resumo?.resumo?.follow_up || 0) +
    (resumo?.resumo?.novo || 0) +
    (resumo?.resumo?.conversando || 0);

  return (
    <LayoutApp>
      <div className="max-w-6xl">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-base-ink">Painel</h1>
          <p className="mt-1 text-sm text-base-ink/55">
            CRM das conversas do WhatsApp e acompanhamento das vendas.
          </p>
        </header>

        {erro && <p className="mb-5 text-sm text-red-600">{erro}</p>}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Card label="Total de conversas" value={resumo?.total ?? 0} />
          <Card label="Comprou" value={resumo?.resumo?.comprou ?? 0} />
          <Card label="Pendente" value={resumo?.resumo?.pendente ?? 0} />
          <Card label="Não respondeu" value={resumo?.resumo?.nao_respondeu ?? 0} />
          <Card label="Follow-up" value={followUp} />
        </div>

        <section className="mt-8 rounded-xs border border-black/5 bg-base-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-medium">Objeções dos clientes</h2>
              <p className="mt-1 text-sm text-base-ink/50">
                As 5 objeções mais frequentes nas conversas.
              </p>
            </div>
            <span className="text-xs text-base-ink/40">
              {resumo?.total ?? 0} conversas
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {objecoes.slice(0, 5).map((item, index) => (
              <div key={item.objecao} className="flex items-center gap-4 border-b border-black/5 pb-3">
                <span className="w-6 text-sm text-base-ink/35">{index + 1}</span>
                <span className="flex-1 text-sm">{item.objecao}</span>
                <span className="text-sm font-medium">{item.total}</span>
              </div>
            ))}

            {!objecoes.length && (
              <p className="text-sm text-base-ink/40">
                Ainda não existem dados suficientes para identificar objeções.
              </p>
            )}
          </div>
        </section>

        <section className="mt-5 rounded-xs border border-black/5 bg-base-white p-6">
          <h2 className="font-medium">Estado do CRM</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            {estados.map(([key, label]) => (
              <div key={key} className="rounded-xs bg-base-fog p-4">
                <p className="text-2xl font-semibold">{resumo?.resumo?.[key] ?? 0}</p>
                <p className="mt-1 text-sm text-base-ink/50">{label}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </LayoutApp>
  );
}

function Card({ label, value }) {
  return (
    <div className="rounded-xs border border-black/5 bg-base-white p-5">
      <p className="text-2xl font-semibold text-base-ink">{value}</p>
      <p className="mt-1 text-sm text-base-ink/50">{label}</p>
    </div>
  );
}
