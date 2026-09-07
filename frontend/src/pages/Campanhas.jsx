import React, { useEffect, useState } from 'react';
import LayoutApp from '../components/LayoutApp.jsx';
import { api } from '../lib/api.js';
import { supabase } from '../lib/supabaseClient.js';
import { IconBolt } from '../components/Icons.jsx';

const SUPABASE_URL = 'https://hckflwxnfcfbypmvdksy.supabase.co';
const ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhja2Zsd3huZmNmYnlwbXZka3N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2MTM0NjAsImV4cCI6MjEwNDE4OTQ2MH0.UJ2y1iGbirOTmN8uRDke-xwuunhnbv7WGzE1rU-T2Sg';

async function buscarListasNumeros() {
  const { data: { session } } = await supabase.auth.getSession();
  const resposta = await fetch(`${SUPABASE_URL}/functions/v1/numeros-api?action=listas`, {
    headers: {
      Authorization: `Bearer ${session?.access_token}`,
      apikey: ANON_KEY,
    },
  });
  if (!resposta.ok) return [];
  return resposta.json();
}

export default function Campanhas() {
  const [contas, setContas] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [campanhas, setCampanhas] = useState([]);
  const [listasNumeros, setListasNumeros] = useState([]);
  const [form, setForm] = useState({
    contaAnuncioId: '',
    produtoId: '',
    orcamentoDiario: 5,
    linkDestino: '',
    listaIncluirId: '',
    listaExcluirId: '',
  });
  const [aCriar, setACriar] = useState(false);
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    api.get('/api/campanhas/contas').then(setContas).catch(() => {});
    api.get('/api/produtos').then(setProdutos).catch(() => {});
    api.get('/api/campanhas').then(setCampanhas).catch(() => {});
    buscarListasNumeros().then(setListasNumeros).catch(() => {});
  }, []);

  async function criarCampanha(e) {
    e.preventDefault();
    setACriar(true);
    setMensagem('');
    try {
      const payload = {
        ...form,
        listaIncluirId: form.listaIncluirId || null,
        listaExcluirId: form.listaExcluirId || null,
      };
      const nova = await api.post('/api/campanhas/criar-automatica', payload);
      setCampanhas([nova, ...campanhas]);
      setMensagem('Campanha criada em modo pausado — revê e ativa no Gestor de Anúncios.');
    } catch (err) {
      setMensagem(err.message);
    } finally {
      setACriar(false);
    }
  }

  return (
    <LayoutApp>
      <h1 className="text-2xl font-semibold text-base-ink mb-1">Campanhas</h1>
      <p className="text-sm text-base-ink/55 mb-8">
        Liga a tua conta de anúncios e cria uma campanha pronta a partir dos teus contactos.
      </p>

      {contas.length === 0 ? (
        <div className="bg-base-white border border-black/5 rounded-xs p-8 text-center">
          <div className="w-10 h-10 mx-auto rounded-xs bg-brand-50 text-brand-600 flex items-center justify-center">
            <IconBolt />
          </div>
          <p className="mt-4 text-sm text-base-ink/60 max-w-sm mx-auto">
            Ainda não ligaste nenhuma conta de anúncios. Liga a tua conta do Meta em Definições para começares a criar campanhas.
          </p>
        </div>
      ) : (
        <form onSubmit={criarCampanha} className="bg-base-white border border-black/5 rounded-xs p-6 grid sm:grid-cols-2 gap-4">
          <Campo label="Conta de anúncios">
            <select value={form.contaAnuncioId} onChange={(e) => setForm({ ...form, contaAnuncioId: e.target.value })} required>
              <option value="">Selecionar…</option>
              {contas.map((c) => <option key={c.id} value={c.id}>{c.plataforma} — {c.ad_account_id}</option>)}
            </select>
          </Campo>
          <Campo label="Produto">
            <select value={form.produtoId} onChange={(e) => setForm({ ...form, produtoId: e.target.value })} required>
              <option value="">Selecionar…</option>
              {produtos.map((p) => <option key={p.id} value={p.id}>{p.nome_produto}</option>)}
            </select>
          </Campo>
          <Campo label="Orçamento diário (USD)">
            <input type="number" min="1" value={form.orcamentoDiario} onChange={(e) => setForm({ ...form, orcamentoDiario: e.target.value })} />
          </Campo>
          <Campo label="Link de destino (WhatsApp/loja)">
            <input value={form.linkDestino} onChange={(e) => setForm({ ...form, linkDestino: e.target.value })} placeholder="https://wa.me/258..." />
          </Campo>

          <Campo label="Incluir números (público personalizado)">
            <select value={form.listaIncluirId} onChange={(e) => setForm({ ...form, listaIncluirId: e.target.value })}>
              <option value="">Nenhuma (não segmentar por números)</option>
              {listasNumeros.map((l) => (
                <option key={l.id} value={l.id}>{l.nome} — {l.total} números</option>
              ))}
            </select>
          </Campo>
          <Campo label="Excluir números">
            <select value={form.listaExcluirId} onChange={(e) => setForm({ ...form, listaExcluirId: e.target.value })}>
              <option value="">Nenhuma (não excluir ninguém)</option>
              {listasNumeros.map((l) => (
                <option key={l.id} value={l.id}>{l.nome} — {l.total} números</option>
              ))}
            </select>
          </Campo>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={aCriar}
              className="bg-brand-500 text-base-white text-sm font-medium px-5 py-2.5 rounded-xs hover:bg-brand-600 transition-colors disabled:opacity-50"
            >
              {aCriar ? 'A criar campanha…' : 'Criar campanha automaticamente'}
            </button>
            {mensagem && <p className="text-sm text-base-ink/60 mt-3">{mensagem}</p>}
          </div>
        </form>
      )}

      <div className="mt-8 space-y-3">
        {campanhas.map((c) => (
          <div key={c.id} className="bg-base-white border border-black/5 rounded-xs p-5 flex items-center justify-between">
            <div>
              <p className="font-medium text-base-ink">{c.nome}</p>
              <p className="text-xs text-base-ink/50 mt-1">Público: {c.publico_tipo} · Orçamento: {c.orcamento_diario} USD/dia</p>
            </div>
            <span className="text-xs font-medium bg-base-fog text-base-ink/60 px-2.5 py-1 rounded-xs capitalize">{c.estado}</span>
          </div>
        ))}
      </div>
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
