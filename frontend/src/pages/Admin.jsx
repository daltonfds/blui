import React, { useEffect, useState } from 'react';
import LayoutApp from '../components/LayoutApp.jsx';
import { api } from '../lib/api.js';

export default function Admin() {
  const [resumo, setResumo] = useState(null);
  const [pendentes, setPendentes] = useState([]);
  const [utilizadores, setUtilizadores] = useState([]);
  const [aba, setAba] = useState('resumo');

  async function carregar() {
    const [r, p, u] = await Promise.all([
      api.get('/api/admin/resumo'),
      api.get('/api/admin/assinaturas-pendentes'),
      api.get('/api/admin/utilizadores'),
    ]);
    setResumo(r); setPendentes(p); setUtilizadores(u);
  }

  useEffect(() => { carregar(); }, []);

  async function aprovar(id) {
    await api.post(`/api/admin/assinaturas/${id}/aprovar`, {});
    carregar();
  }

  async function rejeitar(id) {
    await api.post(`/api/admin/assinaturas/${id}/rejeitar`, {});
    carregar();
  }

  return (
    <LayoutApp>
      <h1 className="text-2xl font-semibold text-base-ink mb-1">Admin</h1>
      <p className="text-sm text-base-ink/55 mb-6">Visão global da BLUI — só visível para administradores.</p>

      {resumo && (
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <Cartao titulo="Utilizadores" valor={resumo.totalUtilizadores} />
          <Cartao titulo="Assinaturas ativas" valor={resumo.assinaturasAtivas} />
          <Cartao titulo="Receita mensal" valor={`R$${resumo.receitaMensalBrl.toFixed(0)}`} />
        </div>
      )}

      <div className="flex gap-4 mb-4 text-sm border-b border-black/5">
        <button onClick={() => setAba('resumo')} className={`pb-2 ${aba === 'resumo' ? 'border-b-2 border-brand-500 text-brand-700' : 'text-base-ink/50'}`}>Pedidos pendentes</button>
        <button onClick={() => setAba('utilizadores')} className={`pb-2 ${aba === 'utilizadores' ? 'border-b-2 border-brand-500 text-brand-700' : 'text-base-ink/50'}`}>Utilizadores</button>
      </div>

      {aba === 'resumo' && (
        <div className="bg-base-white border border-black/5 rounded-xs divide-y divide-black/5">
          {pendentes.length === 0 && <p className="p-5 text-sm text-base-ink/40">Sem pedidos pendentes.</p>}
          {pendentes.map((p) => (
            <div key={p.id} className="flex justify-between items-center p-4">
              <div>
                <p className="text-sm text-base-ink">{p.profiles?.nome || 'Sem nome'} — {p.planos?.nome} (R${Number(p.planos?.preco_brl).toFixed(0)})</p>
                <p className="text-xs text-base-ink/40">{p.profiles?.telefone}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => aprovar(p.id)} className="text-xs bg-brand-500 text-base-white px-3 py-1.5 rounded-xs">Aprovar</button>
                <button onClick={() => rejeitar(p.id)} className="text-xs text-signal-red border border-signal-red/30 px-3 py-1.5 rounded-xs">Rejeitar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {aba === 'utilizadores' && (
        <div className="bg-base-white border border-black/5 rounded-xs divide-y divide-black/5">
          {utilizadores.map((u) => (
            <div key={u.id} className="flex justify-between items-center p-4">
              <div>
                <p className="text-sm text-base-ink">{u.nome || 'Sem nome'} {u.is_admin && '👑'}</p>
                <p className="text-xs text-base-ink/40">{u.telefone || '—'} · {u.localizacao || '—'}</p>
              </div>
              <span className="text-xs text-base-ink/60">
                {u.assinaturas?.[0]?.planos?.nome || 'Sem plano'} — {u.assinaturas?.[0]?.estado || '—'}
              </span>
            </div>
          ))}
        </div>
      )}
    </LayoutApp>
  );
}

function Cartao({ titulo, valor }) {
  return (
    <div className="bg-base-white border border-black/5 rounded-xs p-5">
      <p className="text-xs text-base-ink/50">{titulo}</p>
      <p className="text-2xl font-bold text-base-ink mt-1">{valor}</p>
    </div>
  );
}
