import React, { useEffect, useMemo, useState } from 'react';
import LayoutApp from '../components/LayoutApp.jsx';
import { api } from '../lib/api.js';

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

const FORM_INICIAL = {
  numero: '',
  nome: '',
  email: '',
  dor_nicho: '',
  canal_origem: 'whatsapp',
  estado: 'novo',
  valor_comprado: '',
};

export default function Contactos() {
  const [contactos, setContactos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [busca, setBusca] = useState('');
  const [copiado, setCopiado] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [form, setForm] = useState(FORM_INICIAL);
  const [guardando, setGuardando] = useState(false);
  const [erro, setErro] = useState('');

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
      [c.numero, c.nome, c.email, c.dor_nicho].some((v) =>
        (v || '').toLowerCase().includes(termo)
      )
    );
  }, [contactos, busca]);

  function copiarNumeros() {
    const texto = listaFiltrada.map((c) => c.numero).join('\n');
    navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1800);
  }

  async function exportarCsv() {
    try {
      const query = filtro ? `?estado=${filtro}` : '';
      const base = import.meta.env.VITE_API_URL || 'http://localhost:4000';

      const { supabase } = await import('../lib/supabaseClient.js');
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const resposta = await fetch(
        `${base}/api/contactos/exportar/csv${query}`,
        {
          headers: session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {},
        }
      );

      if (!resposta.ok) {
        throw new Error('Não foi possível exportar os contactos.');
      }

      const blob = await resposta.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'contactos.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setErro(err.message || 'Erro ao exportar CSV.');
    }
  }

  function abrirModal() {
    setErro('');
    setForm(FORM_INICIAL);
    setModalAberto(true);
  }

  function fecharModal() {
    if (guardando) return;
    setModalAberto(false);
  }

  function alterarCampo(campo, valor) {
    setForm((atual) => ({
      ...atual,
      [campo]: valor,
    }));
  }

  async function criarContacto(e) {
    e.preventDefault();
    setErro('');

    if (!form.numero.trim()) {
      setErro('O número de telefone é obrigatório.');
      return;
    }

    setGuardando(true);

    try {
      const contacto = await api.post('/api/contactos', {
        numero: form.numero.trim(),
        nome: form.nome.trim() || null,
        email: form.email.trim() || null,
        dor_nicho: form.dor_nicho.trim() || null,
        canal_origem: form.canal_origem,
        estado: form.estado,
        valor_comprado: form.valor_comprado
          ? Number(form.valor_comprado)
          : 0,
      });

      setContactos((atuais) => [
        contacto,
        ...atuais.filter((c) => c.id !== contacto.id),
      ]);

      setModalAberto(false);
      setForm(FORM_INICIAL);
    } catch (err) {
      setErro(err.message || 'Não foi possível guardar o contacto.');
    } finally {
      setGuardando(false);
    }
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

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={abrirModal}
            className="text-sm font-medium bg-brand-600 text-white rounded-xs px-4 py-2 hover:bg-brand-700 transition-colors"
          >
            + Adicionar contacto
          </button>

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
              filtro === f.chave
                ? 'bg-base-ink text-base-white'
                : 'bg-base-white border border-black/10 text-base-ink/60'
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

      {erro && !modalAberto && (
        <div className="mb-5 rounded-xs border border-red-200 bg-red-50 px-4 py-3 text-sm text-signal-red">
          {erro}
        </div>
      )}

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
              const rotulo =
                ROTULO_ESTADO[c.estado] || ROTULO_ESTADO.novo;

              return (
                <tr
                  key={c.id}
                  className="border-b border-black/5 last:border-0 hover:bg-base-fog/60"
                >
                  <td className="px-5 py-3 text-base-ink/80">
                    {c.numero}
                  </td>

                  <td className="px-5 py-3 text-base-ink/80">
                    {c.nome || '—'}
                  </td>

                  <td className="px-5 py-3 text-base-ink/60">
                    {c.dor_nicho || '—'}
                  </td>

                  <td className="px-5 py-3 text-base-ink/60 capitalize">
                    {c.canal_origem}
                  </td>

                  <td className="px-5 py-3">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-xs ${rotulo.cor}`}
                    >
                      {rotulo.texto}
                    </span>
                  </td>

                  <td className="px-5 py-3 text-base-ink/80">
                    {c.valor_comprado
                      ? `${c.valor_comprado} MZN`
                      : '—'}
                  </td>
                </tr>
              );
            })}

            {listaFiltrada.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-10 text-center text-base-ink/40 text-sm"
                >
                  Ainda não há contactos aqui. Adiciona o primeiro contacto
                  para começar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalAberto && (
        <div
          className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) fecharModal();
          }}
        >
          <div className="w-full max-w-lg bg-base-white rounded-xs border border-black/5 shadow-xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-black/5">
              <div>
                <h2 className="text-lg font-semibold text-base-ink">
                  Adicionar contacto
                </h2>
                <p className="text-sm text-base-ink/50 mt-1">
                  Guarda um novo cliente ou lead no BLUI.
                </p>
              </div>

              <button
                type="button"
                onClick={fecharModal}
                className="text-base-ink/40 hover:text-base-ink text-xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={criarContacto} className="p-6 space-y-4">
              {erro && (
                <div className="rounded-xs border border-red-200 bg-red-50 px-4 py-3 text-sm text-signal-red">
                  {erro}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-base-ink mb-1.5">
                  Número *
                </label>
                <input
                  value={form.numero}
                  onChange={(e) => alterarCampo('numero', e.target.value)}
                  placeholder="+258 84 123 4567"
                  required
                  className="w-full text-sm border border-black/10 rounded-xs px-3.5 py-2.5 outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-base-ink mb-1.5">
                    Nome
                  </label>
                  <input
                    value={form.nome}
                    onChange={(e) => alterarCampo('nome', e.target.value)}
                    placeholder="Nome do cliente"
                    className="w-full text-sm border border-black/10 rounded-xs px-3.5 py-2.5 outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-base-ink mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => alterarCampo('email', e.target.value)}
                    placeholder="cliente@email.com"
                    className="w-full text-sm border border-black/10 rounded-xs px-3.5 py-2.5 outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-base-ink mb-1.5">
                  Nicho / dor
                </label>
                <input
                  value={form.dor_nicho}
                  onChange={(e) =>
                    alterarCampo('dor_nicho', e.target.value)
                  }
                  placeholder="Ex.: emagrecimento, acne, vendas..."
                  className="w-full text-sm border border-black/10 rounded-xs px-3.5 py-2.5 outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-base-ink mb-1.5">
                    Canal
                  </label>
                  <select
                    value={form.canal_origem}
                    onChange={(e) =>
                      alterarCampo('canal_origem', e.target.value)
                    }
                    className="w-full text-sm border border-black/10 rounded-xs px-3.5 py-2.5 outline-none focus:border-brand-500 bg-base-white"
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="messenger">Messenger</option>
                    <option value="instagram">Instagram</option>
                    <option value="site">Site</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-base-ink mb-1.5">
                    Estado
                  </label>
                  <select
                    value={form.estado}
                    onChange={(e) =>
                      alterarCampo('estado', e.target.value)
                    }
                    className="w-full text-sm border border-black/10 rounded-xs px-3.5 py-2.5 outline-none focus:border-brand-500 bg-base-white"
                  >
                    <option value="novo">Novo</option>
                    <option value="conversando">Em conversa</option>
                    <option value="pendente">Pendente</option>
                    <option value="comprou">Comprou</option>
                    <option value="nao_respondeu">Não respondeu</option>
                    <option value="follow_up">Follow-up</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-base-ink mb-1.5">
                    Valor (MZN)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.valor_comprado}
                    onChange={(e) =>
                      alterarCampo('valor_comprado', e.target.value)
                    }
                    placeholder="0"
                    className="w-full text-sm border border-black/10 rounded-xs px-3.5 py-2.5 outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={fecharModal}
                  disabled={guardando}
                  className="text-sm font-medium border border-black/10 rounded-xs px-4 py-2.5 hover:border-black/20 disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={guardando}
                  className="text-sm font-medium bg-base-ink text-base-white rounded-xs px-5 py-2.5 hover:bg-brand-900 disabled:opacity-50"
                >
                  {guardando ? 'A guardar...' : 'Guardar contacto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </LayoutApp>
  );
}
