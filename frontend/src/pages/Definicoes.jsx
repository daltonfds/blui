import React, { useState } from 'react';
import LayoutApp from '../components/LayoutApp.jsx';
import { api } from '../lib/api.js';

export default function Definicoes() {
  const [form, setForm] = useState({ plataforma: 'meta', ad_account_id: '', page_id: '', pixel_id: '', access_token: '' });
  const [mensagem, setMensagem] = useState('');

  async function ligarConta(e) {
    e.preventDefault();
    try {
      await api.post('/api/campanhas/contas', form);
      setMensagem('Conta ligada com sucesso.');
    } catch (err) {
      setMensagem(err.message);
    }
  }

  return (
    <LayoutApp>
      <h1 className="text-2xl font-semibold text-base-ink mb-1">Definições</h1>
      <p className="text-sm text-base-ink/55 mb-8">Liga as tuas contas de anúncios para ativar campanhas e tracking.</p>

      <form onSubmit={ligarConta} className="bg-base-white border border-black/5 rounded-xs p-6 max-w-lg space-y-4">
        <p className="text-xs text-base-ink/45">
          Obtém estes valores no Gestor de Anúncios do Meta (Business Settings → Utilizadores do sistema)
          após autorizares a aplicação Blui.
        </p>
        <Campo label="ID da conta de anúncios">
          <input required value={form.ad_account_id} onChange={(e) => setForm({ ...form, ad_account_id: e.target.value })} />
        </Campo>
        <Campo label="ID da página do Facebook">
          <input value={form.page_id} onChange={(e) => setForm({ ...form, page_id: e.target.value })} />
        </Campo>
        <Campo label="ID do pixel">
          <input value={form.pixel_id} onChange={(e) => setForm({ ...form, pixel_id: e.target.value })} />
        </Campo>
        <Campo label="Token de acesso">
          <input type="password" value={form.access_token} onChange={(e) => setForm({ ...form, access_token: e.target.value })} />
        </Campo>
        <button className="bg-base-ink text-base-white text-sm font-medium px-5 py-2.5 rounded-xs hover:bg-brand-900 transition-colors">
          Ligar conta
        </button>
        {mensagem && <p className="text-sm text-base-ink/60">{mensagem}</p>}
      </form>
    </LayoutApp>
  );
}

function Campo({ label, children }) {
  const filho = React.cloneElement(children, {
    className: 'w-full border border-black/10 rounded-xs px-3.5 py-2.5 text-sm text-base-ink focus:border-brand-500 transition-colors',
  });
  return (
    <label className="block">
      <span className="text-xs font-medium text-base-ink/60">{label}</span>
      <div className="mt-1.5">{filho}</div>
    </label>
  );
}
