import React, { useEffect, useMemo, useState } from 'react';
import LayoutApp from '../components/LayoutApp.jsx';
import { api } from '../lib/api.js';
import { IconCheck } from '../components/Icons.jsx';

const FILTROS = [
  { chave: '', label: 'Todos' },
  { chave: 'comprou', label: 'Compraram' },
  { chave: 'pendente', label: 'Pendentes' },
  { chave: 'conversando', label: 'Em conversa' },
  { chave: 'nao_respondeu', label: 'Não responderam' },
];

const ROTULO_ESTADO = {
  novo: { texto: 'Novo', cor: 'bg-base-fog text-base-ink/60' },
  conversando: { texto: 'Em conversa', cor: 'bg-base-fog text-base-ink/70' },
  pendente: { texto: 'Pendente', cor: 'bg-red-50 text-signal-red' },
  comprou: { texto: 'Comprou', cor: 'bg-brand-50 text-brand-700' },
  nao_respondeu: { texto: 'Não respondeu', cor: 'bg-red-50 text-signal-red' },
  follow_up: { texto: 'Follow-up', cor: 'bg-base-fog text-base-ink/70' },
};

export default function Contactos() {
  const [contactos, setContactos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [busca, setBusca] = useState('');
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    carregar();
  }, [filtro]);

  function carregar() {
    const query = filtro ? `?estado=${filtro}` : '';
    api.get(`/api/contactos${query}`).then(setContactos).catch(() => {});
  }

  const listaFiltrada = useMemo(() => {
    if (!busca.trim()) return contactos;
    const termo = busca.toLowerCase();
    return contactos.filter((c) =>
      [c.numero, c.nome, c.email, c.dor_nicho].some((v) => (v || '').toLowerCase().includes(termo))
    );
  }, [contactos, busca]);

  function copiarNumeros() {
    const texto = listaFiltrada.map((c) => c.numero).join('\n');
    navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1800);
  }

  function exportarCsv() {
    const query = filtro ? `?estado=${filtro}` : '';
    const base = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    window.open(`${base}/api/contactos/exportar/csv${query}`, '_blank');
  }

  return (
    <LayoutApp>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-base-ink">Contactos</h1>
          <p className="text-sm text-base-ink/55 mt-1">
            Copia uma lista ou exporta em CSV para segmentar os teus anúncios.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copiarNumeros}
            className="text-sm font-medium border border-black/10 rounded-xs px-4 py-2 hover:border-black/20 transition-colors"
          >
            {copiado ? 'Copiado ✓' : 'Copiar números'}
          </button>
          <button
            onClick={exportarCsv}
            className="text-sm font-medium bg-base-ink text-base-white rounded-xs px-4 py-2 hover:bg-brand-900 transition-colors"
          >
            Exportar CSV
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {FILTROS.map((f) => (
          <button
            key={f.chave}
            onClick={() => setFiltro(f.chave)}
            className={`text-sm font-medium px-3.5 py-1.5 rounded-xs transition-colors ${
              filtro === f.chave ? 'bg-base-ink text-base-white' : 'bg-base-white border border-black/10 text-base-ink/60'
            }`}
          >
            {f.label}
          </button>
        ))}
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Procurar por nome, número ou nicho…"
          className="ml-auto text-sm border border-black/10 rounded-xs px-3.5 py-1.5 w-64 placeholder:text-base-ink/30"
        />
      </div>

      <div className="bg-base-white border border-black/5 rounded-xs overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-base-ink/45 border-b border-black/5">
              <th className="font-medium px-5 py-3">Número</th>
              <th className="font-medium px-5 py-3">Nome</th>
              <th className="font-medium px-5 py-3">Nicho / dor</th>
              <th className="font-medium px-5 py-3">Origem</th>
              <th className="font-medium px-5 py-3">Estado</th>
              <th className="font-medium px-5 py-3">Valor</th>
            </tr>
          </thead>
          <tbody>
            {listaFiltrada.map((c) => {
              const rotulo = ROTULO_ESTADO[c.estado] || ROTULO_ESTADO.novo;
              return (
                <tr key={c.id} className="border-b border-black/5 last:border-0 hover:bg-base-fog/60">
                  <td className="px-5 py-3 text-base-ink/80">{c.numero}</td>
                  <td className="px-5 py-3 text-base-ink/80">{c.nome || '—'}</td>
                  <td className="px-5 py-3 text-base-ink/60">{c.dor_nicho || '—'}</td>
                  <td className="px-5 py-3 text-base-ink/60 capitalize">{c.canal_origem}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-xs ${rotulo.cor}`}>{rotulo.texto}</span>
                  </td>
                  <td className="px-5 py-3 text-base-ink/80">
                    {c.valor_comprado ? `${c.valor_comprado} MZN` : '—'}
                  </td>
                </tr>
              );
            })}
            {listaFiltrada.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-base-ink/40 text-sm">
                  Ainda não há contactos aqui. Assim que alguém escrever no WhatsApp, aparece nesta lista.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </LayoutApp>
  );
}
