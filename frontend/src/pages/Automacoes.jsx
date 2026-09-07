import React, { useEffect, useState } from 'react';
import { api } from '../lib/api.js';

export default function Automacoes() {
  const [items, setItems] = useState([]);
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('remarketing');

  const carregar = () => api.get('/api/automacoes').then(setItems);

  useEffect(() => { carregar(); }, []);

  async function criar(e) {
    e.preventDefault();
    if (!nome.trim()) return;
    await api.post('/api/automacoes', { nome, tipo });
    setNome('');
    carregar();
  }

  async function alternar(item) {
    await api.patch(`/api/automacoes/${item.id}`, { ativo: !item.ativo });
    carregar();
  }

  return (
    <div className="min-h-screen bg-base-fog p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-semibold">Automações</h1>
        <p className="mt-2 text-sm text-base-ink/60">Cria e controla os fluxos automáticos do BLUI.</p>

        <form onSubmit={criar} className="mt-8 flex flex-col gap-3 rounded-xl bg-base-white p-5 shadow-sm md:flex-row">
          <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome da automação"
            className="flex-1 rounded-lg border border-black/10 px-4 py-3" />
          <select value={tipo} onChange={e => setTipo(e.target.value)}
            className="rounded-lg border border-black/10 px-4 py-3">
            <option value="remarketing">Remarketing</option>
            <option value="carrinho_abandonado">Carrinho abandonado</option>
            <option value="checkout_abandonado">Checkout abandonado</option>
            <option value="pos_venda">Pós-venda</option>
            <option value="reativacao">Reativação</option>
          </select>
          <button className="rounded-lg bg-base-ink px-5 py-3 text-white">Criar</button>
        </form>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map(item => (
            <div key={item.id} className="rounded-xl border border-black/5 bg-base-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">{item.nome}</h2>
                  <p className="mt-1 text-sm text-base-ink/50">{item.tipo}</p>
                </div>
                <button onClick={() => alternar(item)}
                  className={`rounded-full px-3 py-1 text-xs ${item.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {item.ativo ? 'Ativa' : 'Pausada'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
