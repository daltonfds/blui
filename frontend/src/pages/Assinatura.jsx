import React, { useEffect, useState } from 'react';
import LayoutApp from '../components/LayoutApp.jsx';
import { api } from '../lib/api.js';

export default function Assinatura() {
  const [planos, setPlanos] = useState([]);
  const [minha, setMinha] = useState(null);
  const [aEscolher, setAEscolher] = useState(null);
  const [mensagem, setMensagem] = useState('');

  async function carregar() {
    const [listaPlanos, assinaturaAtual] = await Promise.all([
      api.get('/api/assinaturas/planos'),
      api.get('/api/assinaturas/minha'),
    ]);
    setPlanos(listaPlanos);
    setMinha(assinaturaAtual);
  }

  useEffect(() => { carregar(); }, []);

  async function escolher(planoId) {
    setAEscolher(planoId);
    setMensagem('');
    try {
      await api.post('/api/assinaturas/escolher', { planoId });
      setMensagem('Pedido enviado! Fica pendente até ser aprovado. Se quiseres acelerar, contacta o suporte.');
      carregar();
    } catch (err) {
      setMensagem(err.message);
    } finally {
      setAEscolher(null);
    }
  }

  const diasRestantes = minha?.ciclo_fim
    ? Math.max(0, Math.ceil((new Date(minha.ciclo_fim) - new Date()) / 86400000))
    : null;

  return (
    <LayoutApp>
      <h1 className="text-2xl font-semibold text-base-ink mb-1">Assinatura</h1>
      <p className="text-sm text-base-ink/55 mb-6">Escolhe o plano que melhor serve o teu negócio.</p>

      {minha && (
        <div className="bg-base-white border border-black/5 rounded-xs p-5 mb-6">
          <p className="text-sm text-base-ink">
            Plano atual: <strong>{minha.planos?.nome}</strong> — estado: <span className="capitalize">{minha.estado}</span>
            {diasRestantes !== null && minha.estado === 'ativa' && ` — ${diasRestantes} dia(s) restantes`}
          </p>
          <p className="text-xs text-base-ink/50 mt-1">
            Mensagens usadas: {minha.mensagens_usadas} / {minha.planos?.mensagens_incluidas}
          </p>
        </div>
      )}

      {mensagem && <p className="text-sm text-brand-600 mb-6">{mensagem}</p>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {planos.map((p) => (
          <div key={p.id} className="bg-base-white border border-black/5 rounded-xs p-5 flex flex-col">
            <h2 className="font-semibold text-base-ink">{p.nome}</h2>
            <p className="text-2xl font-bold text-base-ink mt-2">R${Number(p.preco_brl).toFixed(0)}</p>
            <p className="text-xs text-base-ink/50 mb-3">{p.dias_validade} dias · {p.mensagens_incluidas} mensagens</p>
            <p className="text-xs text-base-ink/60 mb-4 flex-1">{p.descricao}</p>
            <ul className="text-xs text-base-ink/70 space-y-1 mb-4">
              {(p.funcionalidades || []).map((f, i) => <li key={i}>✓ {f}</li>)}
            </ul>
            <button
              onClick={() => escolher(p.id)}
              disabled={aEscolher === p.id}
              className="bg-brand-500 text-base-white text-sm font-medium px-4 py-2 rounded-xs hover:bg-brand-600 transition-colors disabled:opacity-50"
            >
              {aEscolher === p.id ? 'A enviar...' : 'Escolher este plano'}
            </button>
          </div>
        ))}
      </div>
    </LayoutApp>
  );
}
