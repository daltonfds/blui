import React, { useEffect, useState } from 'react';
import LayoutApp from '../components/LayoutApp.jsx';
import { supabase } from '../lib/supabaseClient.js';

const SUPABASE_URL = 'https://hckflwxnfcfbypmvdksy.supabase.co';
const ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhja2Zsd3huZmNmYnlwbXZka3N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2MTM0NjAsImV4cCI6MjEwNDE4OTQ2MH0.UJ2y1iGbirOTmN8uRDke-xwuunhnbv7WGzE1rU-T2Sg';

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
  const [texto, setTexto] = useState('');
  const [nomeLista, setNomeLista] = useState('');
  const [preview, setPreview] = useState(null);
  const [carregandoOcr, setCarregandoOcr] = useState(false);
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
        body: { texto, nome: nomeLista || undefined },
      });
      setTexto(''); setNomeLista('');
      setSucesso(`Lista guardada com ${resultado.lista.total} números.`);
      carregarListas();
    } catch (e) {
      setErro(e.message);
    }
  }

  async function lerImagem(e) {
    const ficheiro = e.target.files[0];
    if (!ficheiro) return;
    setCarregandoOcr(true); setErro(''); setPreview(null);
    try {
      const formData = new FormData();
      formData.append('imagem', ficheiro);
      const dados = await chamarNumerosApi('imagem', { method: 'POST', body: formData, isFormData: true });
      setPreview(dados);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregandoOcr(false);
      e.target.value = '';
    }
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
      carregarListas();
    } catch (e) {
      setErro(e.message);
    }
  }

  return (
    <LayoutApp>
      <h1 className="text-2xl font-semibold text-base-ink mb-1">Números</h1>
      <p className="text-sm text-base-ink/55 mb-8">
        Adiciona números manualmente ou lê de uma imagem, para usar como segmentação (incluir/excluir) nas campanhas.
      </p>

      {erro && <p className="text-sm text-signal-red mb-4">{erro}</p>}
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
          placeholder={'+258849191742\n+351912345678'}
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
        <h2 className="text-sm font-medium text-base-ink">Ler números de uma imagem</h2>
        <input type="file" accept="image/*" onChange={lerImagem} disabled={carregandoOcr} className="text-sm" />
        {carregandoOcr && <p className="text-sm text-base-ink/50">A ler imagem...</p>}

        {preview && (
          <div className="space-y-3">
            <p className="text-sm text-base-ink/70">{preview.numeros.length} números reconhecidos:</p>
            <ul className="text-sm max-h-48 overflow-y-auto border border-black/10 rounded-xs divide-y divide-black/5">
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
          <div key={l.id} className="flex justify-between items-center py-2.5 border-b border-black/5 last:border-b-0">
            <span className="text-sm text-base-ink">
              {l.nome} — <strong>{l.total}</strong> números <span className="text-base-ink/40">({l.origem})</span>
            </span>
            <div className="flex gap-3">
              <button onClick={() => copiarLista(l.id)} className="text-xs text-brand-600 underline">Copiar</button>
              <button onClick={() => apagarLista(l.id)} className="text-xs text-signal-red underline">Apagar</button>
            </div>
          </div>
        ))}
      </div>
    </LayoutApp>
  );
}
