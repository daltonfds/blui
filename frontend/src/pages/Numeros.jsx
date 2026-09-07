import React, { useEffect, useState } from 'react';
import LayoutApp from '../components/LayoutApp.jsx';
import { supabase } from '../lib/supabaseClient.js';

const SUPABASE_URL = 'https://hckflwxnfcfbypmvdksy.supabase.co';
const ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhja2Zsd3huZmNmYnlwbXZka3N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2MTM0NjAsImV4cCI6MjEwNDE4OTQ2MH0.UJ2y1iGbirOTmN8uRDke-xwuunhnbv7WGzE1rU-T2Sg';

const PAISES = [
  { valor: 'MZ', nome: 'Moçambique (+258)' },
  { valor: 'ZA', nome: 'África do Sul (+27)' },
  { valor: 'AO', nome: 'Angola (+244)' },
  { valor: 'BR', nome: 'Brasil (+55)' },
  { valor: 'PT', nome: 'Portugal (+351)' },
];

const MAX_IMAGENS = 100;
const MAX_TAMANHO_MB = 10;

async function chamarNumerosApi(action, { method = 'GET', body, isFormData, query = '' } = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const resposta = await fetch(
    `${SUPABASE_URL}/functions/v1/numeros-api?action=${action}${query}`,
    {
      method,
      headers: {
        Authorization: `Bearer ${session?.access_token}`,
        apikey: ANON_KEY,
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      },
      body: isFormData ? body : body ? JSON.stringify(body) : undefined,
    }
  );
  const dados = await resposta.json();
  if (!resposta.ok) throw new Error(dados.erro || 'Erro ao comunicar com o servidor.');
  return dados;
}

export default function Numeros() {
  const [listas, setListas] = useState([]);
  const [listaAberta, setListaAberta] = useState(null); // id da lista expandida
  const [conteudoListaAberta, setConteudoListaAberta] = useState(null);
  const [aCarregarConteudo, setACarregarConteudo] = useState(false);

  const [texto, setTexto] = useState('');
  const [nomeLista, setNomeLista] = useState('');
  const [paisPadrao, setPaisPadrao] = useState('MZ');

  const [preview, setPreview] = useState(null);
  const [progresso, setProgresso] = useState(null); // { atual, total }
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  async function carregarListas() {
    try {
      setListas(await chamarNumerosApi('listas'));
    } catch (e) {
      setErro(e.message);
    }
  }

  useEffect(() => { carregarListas(); }, []);

  async function adicionarManual() {
    setErro(''); setSucesso('');
    try {
      const resultado = await chamarNumerosApi('manual', {
        method: 'POST',
        body: { texto, nome: nomeLista || undefined, paisPadrao },
      });
      setTexto(''); setNomeLista('');
      setSucesso(`Lista guardada com ${resultado.lista.total} números.`);
      carregarListas();
    } catch (e) {
      setErro(e.message);
    }
  }

  async function lerImagens(e) {
    const ficheiros = Array.from(e.target.files || []);
    if (ficheiros.length === 0) return;

    setErro(''); setSucesso(''); setPreview(null);

    if (ficheiros.length > MAX_IMAGENS) {
      setErro(`Escolhe no máximo ${MAX_IMAGENS} imagens de cada vez (selecionaste ${ficheiros.length}).`);
      e.target.value = '';
      return;
    }

    const grandesDemais = ficheiros.filter((f) => f.size > MAX_TAMANHO_MB * 1024 * 1024);
    if (grandesDemais.length > 0) {
      setErro(`${grandesDemais.length} imagem(ns) acima de ${MAX_TAMANHO_MB}MB foram ignoradas: ${grandesDemais.map((f) => f.name).join(', ')}`);
    }

    const validos = ficheiros.filter((f) => f.size <= MAX_TAMANHO_MB * 1024 * 1024);
    if (validos.length === 0) {
      e.target.value = '';
      return;
    }

    const todosNumeros = [];
    const todosInvalidos = [];
    const errosOcr = [];
    const vistos = new Set();

    for (let i = 0; i < validos.length; i++) {
      setProgresso({ atual: i + 1, total: validos.length });
      try {
        const formData = new FormData();
        formData.append('imagem', validos[i]);
        formData.append('paisPadrao', paisPadrao);
        const dados = await chamarNumerosApi('imagem', { method: 'POST', body: formData, isFormData: true });

        for (const n of dados.numeros || []) {
          if (!vistos.has(n.numero)) {
            vistos.add(n.numero);
            todosNumeros.push(n);
          }
        }
        todosInvalidos.push(...(dados.invalidos || []));
        if (dados.ocrErro) errosOcr.push(`${validos[i].name}: ${dados.ocrErro}`);
      } catch (err) {
        errosOcr.push(`${validos[i].name}: ${err.message}`);
      }
    }

    setProgresso(null);
    setPreview({ numeros: todosNumeros, invalidos: todosInvalidos });
    if (errosOcr.length > 0) setErro(`Avisos: ${errosOcr.join(' | ')}`);
    e.target.value = '';
  }

  async function confirmarPreview() {
    setErro('');
    try {
      const resultado = await chamarNumerosApi('confirmar', { method: 'POST', body: { numeros: preview.numeros } });
      setSucesso(`Lista guardada com ${resultado.lista.total} números.`);
      setPreview(null);
      carregarListas();
    } catch (e) {
      setErro(e.message);
    }
  }

  function removerDoPreview(index) {
    setPreview((prev) => ({ ...prev, numeros: prev.numeros.filter((_, i) => i !== index) }));
  }

  async function copiarLista(id) {
    try {
      const lista = await chamarNumerosApi('lista', { query: `&id=${id}` });
      const texto = lista.numeros.map((n) => n.numero).join('\n');
      await navigator.clipboard.writeText(texto);
      setSucesso(`${lista.numeros.length} números copiados.`);
    } catch (e) {
      setErro(e.message);
    }
  }

  async function apagarLista(id) {
    if (!confirm('Apagar esta lista? Não podes desfazer.')) return;
    try {
      await chamarNumerosApi('lista', { method: 'DELETE', query: `&id=${id}` });
      if (listaAberta === id) { setListaAberta(null); setConteudoListaAberta(null); }
      carregarListas();
    } catch (e) {
      setErro(e.message);
    }
  }

  async function alternarVerLista(id) {
    if (listaAberta === id) {
      setListaAberta(null);
      setConteudoListaAberta(null);
      return;
    }
    setListaAberta(id);
    setConteudoListaAberta(null);
    setACarregarConteudo(true);
    try {
      const lista = await chamarNumerosApi('lista', { query: `&id=${id}` });
      setConteudoListaAberta(lista);
    } catch (e) {
      setErro(e.message);
    } finally {
      setACarregarConteudo(false);
    }
  }

  return (
    <LayoutApp>
      <h1 className="text-2xl font-semibold text-base-ink mb-1">Números</h1>
      <p className="text-sm text-base-ink/55 mb-6">
        Adiciona números manualmente ou lê de imagens, para usar como segmentação (incluir/excluir) nas campanhas.
      </p>

      <div className="mb-6 max-w-xs">
        <label className="block text-xs font-medium text-base-ink/60 mb-1.5">
          País padrão (para números sem código de país)
        </label>
        <select
          value={paisPadrao}
          onChange={(e) => setPaisPadrao(e.target.value)}
          className="w-full border border-black/10 rounded-xs px-3.5 py-2.5 text-sm text-base-ink focus:border-brand-500 transition-colors"
        >
          {PAISES.map((p) => <option key={p.valor} value={p.valor}>{p.nome}</option>)}
        </select>
      </div>

      {erro && <p className="text-sm text-signal-red mb-4 whitespace-pre-wrap">{erro}</p>}
      {sucesso && <p className="text-sm text-emerald-600 mb-4">{sucesso}</p>}

      <div className="bg-base-white border border-black/5 rounded-xs p-6 mb-6 space-y-3">
        <h2 className="text-sm font-medium text-base-ink">Adicionar manualmente</h2>
        <input
          className="w-full border border-black/10 rounded-xs px-3.5 py-2.5 text-sm text-base-ink focus:border-brand-500 transition-colors"
          placeholder="Nome da lista (opcional)"
          value={nomeLista}
          onChange={(e) => setNomeLista(e.target.value)}
        />
        <textarea
          className="w-full border border-black/10 rounded-xs px-3.5 py-2.5 text-sm text-base-ink focus:border-brand-500 transition-colors"
          rows={4}
          placeholder={'+258 84 623 6380\n84 623 6380\n082 123 4567'}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
        <button
          onClick={adicionarManual}
          disabled={!texto.trim()}
          className="bg-brand-500 text-base-white text-sm font-medium px-5 py-2.5 rounded-xs hover:bg-brand-600 transition-colors disabled:opacity-50"
        >
          Guardar lista
        </button>
      </div>

      <div className="bg-base-white border border-black/5 rounded-xs p-6 mb-6 space-y-3">
        <h2 className="text-sm font-medium text-base-ink">Ler números de imagens</h2>
        <p className="text-xs text-base-ink/40">Até {MAX_IMAGENS} imagens de cada vez, {MAX_TAMANHO_MB}MB no máximo por imagem.</p>
        <input type="file" accept="image/*" multiple onChange={lerImagens} disabled={!!progresso} className="text-sm" />

        {progresso && (
          <div className="space-y-1">
            <p className="text-sm text-base-ink/60">A processar imagem {progresso.atual} de {progresso.total}...</p>
            <div className="w-full h-1.5 bg-base-fog rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-500 transition-all"
                style={{ width: `${(progresso.atual / progresso.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {preview && (
          <div className="space-y-3">
            <p className="text-sm text-base-ink/70">{preview.numeros.length} números únicos reconhecidos:</p>
            <ul className="text-sm max-h-64 overflow-y-auto border border-black/10 rounded-xs divide-y divide-black/5">
              {preview.numeros.map((n, i) => (
                <li key={i} className="flex justify-between items-center px-3.5 py-2">
                  <span className="text-base-ink">{n.formatado} <span className="text-base-ink/40">({n.pais})</span></span>
                  <button onClick={() => removerDoPreview(i)} className="text-signal-red text-xs">remover</button>
                </li>
              ))}
            </ul>
            <button
              onClick={confirmarPreview}
              disabled={preview.numeros.length === 0}
              className="bg-brand-500 text-base-white text-sm font-medium px-5 py-2.5 rounded-xs hover:bg-brand-600 transition-colors disabled:opacity-50"
            >
              Confirmar e guardar
            </button>
          </div>
        )}
      </div>

      <div className="bg-base-white border border-black/5 rounded-xs p-6">
        <h2 className="text-sm font-medium text-base-ink mb-3">Listas guardadas</h2>
        {listas.length === 0 && <p className="text-sm text-base-ink/40">Ainda não tens listas.</p>}
        {listas.map((l) => (
          <div key={l.id} className="border-b border-black/5 last:border-b-0">
            <div className="flex justify-between items-center py-2.5">
              <button
                onClick={() => alternarVerLista(l.id)}
                className="text-sm text-base-ink text-left hover:text-brand-600 transition-colors"
              >
                {l.nome} — <strong>{l.total}</strong> números <span className="text-base-ink/40">({l.origem})</span>
              </button>
              <div className="flex gap-3 shrink-0">
                <button onClick={() => alternarVerLista(l.id)} className="text-xs text-brand-600 underline">
                  {listaAberta === l.id ? 'Fechar' : 'Ver'}
                </button>
                <button onClick={() => copiarLista(l.id)} className="text-xs text-brand-600 underline">Copiar</button>
                <button onClick={() => apagarLista(l.id)} className="text-xs text-signal-red underline">Apagar</button>
              </div>
            </div>

            {listaAberta === l.id && (
              <div className="pb-3 pl-2">
                {aCarregarConteudo && <p className="text-xs text-base-ink/40">A carregar...</p>}
                {conteudoListaAberta && (
                  <ul className="text-sm max-h-56 overflow-y-auto border border-black/10 rounded-xs divide-y divide-black/5">
                    {conteudoListaAberta.numeros.map((n, i) => (
                      <li key={i} className="px-3.5 py-2 text-base-ink">
                        {n.formatado} <span className="text-base-ink/40">({n.pais})</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </LayoutApp>
  );
}
