import React, { useEffect, useState } from 'react';
import LayoutApp from '../components/LayoutApp.jsx';
import { api } from '../lib/api.js';

const VAZIO = {
  nome_produto: '',
  sobre_produto: '',
  forma_entrega: 'cash_on_delivery',
  forma_pagamento: '',
  idioma: 'pt',
  script_abertura: '',
  script_remarketing_24h: '',
};

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [form, setForm] = useState(VAZIO);
  const [aGuardar, setAGuardar] = useState(false);

  useEffect(() => { carregar(); }, []);

  function carregar() {
    api.get('/api/produtos').then(setProdutos).catch(() => {});
  }

  async function guardar(e) {
    e.preventDefault();
    setAGuardar(true);
    try {
      await api.post('/api/produtos', form);
      setForm(VAZIO);
      carregar();
    } finally {
      setAGuardar(false);
    }
  }

  return (
    <LayoutApp>
      <h1 className="text-2xl font-semibold text-base-ink mb-1">Produtos e treino</h1>
      <p className="text-sm text-base-ink/55 mb-8">
        O que o agente diz sobre cada produto vem daqui: descrição, entrega, pagamento e scripts.
      </p>

      <div className="grid lg:grid-cols-5 gap-8">
        <form onSubmit={guardar} className="lg:col-span-2 bg-base-white border border-black/5 rounded-xs p-6 space-y-4 h-fit">
          <Campo label="Nome do produto">
            <input required value={form.nome_produto} onChange={(v) => setForm({ ...form, nome_produto: v })} />
          </Campo>
          <Campo label="Sobre o produto">
            <textarea rows={3} value={form.sobre_produto} onChange={(v) => setForm({ ...form, sobre_produto: v })} />
          </Campo>
          <Campo label="Forma de entrega">
            <select value={form.forma_entrega} onChange={(v) => setForm({ ...form, forma_entrega: v })}>
              <option value="cash_on_delivery">Pagamento na entrega</option>
              <option value="pagamento_antecipado">Pagamento antecipado</option>
            </select>
          </Campo>
          <Campo label="Forma de pagamento">
            <input value={form.forma_pagamento} onChange={(v) => setForm({ ...form, forma_pagamento: v })} placeholder="M-Pesa, e-Mola, transferência…" />
          </Campo>
          <Campo label="Idioma do atendimento">
            <select value={form.idioma} onChange={(v) => setForm({ ...form, idioma: v })}>
              <option value="pt">Português</option>
              <option value="en">Inglês</option>
            </select>
          </Campo>
          <Campo label="Script de abertura">
            <textarea rows={2} value={form.script_abertura} onChange={(v) => setForm({ ...form, script_abertura: v })} />
          </Campo>
          <Campo label="Script de remarketing (24h)">
            <textarea rows={2} value={form.script_remarketing_24h} onChange={(v) => setForm({ ...form, script_remarketing_24h: v })} />
          </Campo>

          <button
            type="submit"
            disabled={aGuardar}
            className="w-full bg-brand-500 text-base-white text-sm font-medium py-2.5 rounded-xs hover:bg-brand-600 transition-colors disabled:opacity-50"
          >
            {aGuardar ? 'A guardar…' : 'Guardar produto'}
          </button>
        </form>

        <div className="lg:col-span-3 space-y-4">
          {produtos.map((p) => (
            <div key={p.id} className="bg-base-white border border-black/5 rounded-xs p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-base-ink">{p.nome_produto}</h3>
                <span className="text-xs text-base-ink/40">{p.idioma === 'pt' ? 'Português' : 'Inglês'}</span>
              </div>
              <p className="text-sm text-base-ink/60 mt-2">{p.sobre_produto || 'Sem descrição.'}</p>
            </div>
          ))}
          {produtos.length === 0 && (
            <div className="text-sm text-base-ink/40 border border-dashed border-black/10 rounded-xs p-8 text-center">
              Ainda não configuraste nenhum produto.
            </div>
          )}
        </div>
      </div>
    </LayoutApp>
  );
}

function Campo({ label, children }) {
  const filho = React.cloneElement(children, {
    onChange: (e) => children.props.onChange(e.target.value),
    className:
      'w-full border border-black/10 rounded-xs px-3.5 py-2.5 text-sm text-base-ink placeholder:text-base-ink/30 focus:border-brand-500 transition-colors',
  });
  return (
    <label className="block">
      <span className="text-xs font-medium text-base-ink/60">{label}</span>
      <div className="mt-1.5">{filho}</div>
    </label>
  );
}
