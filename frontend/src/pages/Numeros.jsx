import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const SUPABASE_URL = "https://hckflwxnfcfbypmvdksy.supabase.co";
const ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhja2Zsd3huZmNmYnlwbXZka3N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2MTM0NjAsImV4cCI6MjEwNDE4OTQ2MH0.UJ2y1iGbirOTmN8uRDke-xwuunhnbv7WGzE1rU-T2Sg";

async function chamarNumerosApi(action, { method = "GET", body, isFormData, query = "" } = {}) {
  const {
    data: { session }
  } = await supabase.auth.getSession();

  const resposta = await fetch(
    `${SUPABASE_URL}/functions/v1/numeros-api?action=${action}${query}`,
    {
      method,
      headers: {
        Authorization: `Bearer ${session?.access_token}`,
        apikey: ANON_KEY,
        ...(isFormData ? {} : { "Content-Type": "application/json" })
      },
      body: isFormData ? body : body ? JSON.stringify(body) : undefined
    }
  );

  const dados = await resposta.json();
  if (!resposta.ok) throw new Error(dados.erro || "Erro ao comunicar com o servidor.");
  return dados;
}

export default function Numeros() {
  const [listas, setListas] = useState([]);
  const [texto, setTexto] = useState("");
  const [nomeLista, setNomeLista] = useState("");
  const [preview, setPreview] = useState(null);
  const [carregandoOcr, setCarregandoOcr] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  async function carregarListas() {
    try {
      const dados = await chamarNumerosApi("listas");
      setListas(dados);
    } catch (e) {
      setErro(e.message);
    }
  }

  useEffect(() => {
    carregarListas();
  }, []);

  async function adicionarManual() {
    setErro("");
    setSucesso("");
    try {
      const resultado = await chamarNumerosApi("manual", {
        method: "POST",
        body: { texto, nome: nomeLista || undefined }
      });
      setTexto("");
      setNomeLista("");
      setSucesso(`Lista guardada com ${resultado.lista.total} números.`);
      carregarListas();
    } catch (e) {
      setErro(e.message);
    }
  }

  async function lerImagem(e) {
    const ficheiro = e.target.files[0];
    if (!ficheiro) return;

    setCarregandoOcr(true);
    setErro("");
    setPreview(null);

    try {
      const formData = new FormData();
      formData.append("imagem", ficheiro);

      const dados = await chamarNumerosApi("imagem", {
        method: "POST",
        body: formData,
        isFormData: true
      });

      setPreview(dados);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregandoOcr(false);
      e.target.value = "";
    }
  }

  async function confirmarPreview() {
    setErro("");
    try {
      const resultado = await chamarNumerosApi("confirmar", {
        method: "POST",
        body: { numeros: preview.numeros }
      });
      setSucesso(`Lista guardada com ${resultado.lista.total} números.`);
      setPreview(null);
      carregarListas();
    } catch (e) {
      setErro(e.message);
    }
  }

  function removerDoPreview(index) {
    setPreview(prev => ({
      ...prev,
      numeros: prev.numeros.filter((_, i) => i !== index)
    }));
  }

  async function copiarLista(id) {
    try {
      const lista = await chamarNumerosApi("lista", { query: `&id=${id}` });
      const texto = lista.numeros.map(n => n.numero).join("\n");
      await navigator.clipboard.writeText(texto);
      setSucesso(`${lista.numeros.length} números copiados para a área de transferência.`);
    } catch (e) {
      setErro(e.message);
    }
  }

  async function apagarLista(id) {
    if (!confirm("Apagar esta lista? Não podes desfazer.")) return;
    try {
      await chamarNumerosApi("lista", { method: "DELETE", query: `&id=${id}` });
      carregarListas();
    } catch (e) {
      setErro(e.message);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Números</h1>
        <p className="text-gray-500">
          Adiciona números manualmente ou lê de uma imagem, para usar depois como
          segmentação (incluir/excluir) nas tuas campanhas.
        </p>
      </div>

      {erro && <p className="text-red-500">{erro}</p>}
      {sucesso && <p className="text-green-600">{sucesso}</p>}

      <section className="rounded-xl border p-5 space-y-3">
        <h2 className="font-semibold">Adicionar manualmente</h2>
        <input
          className="w-full border rounded p-2"
          placeholder="Nome da lista (opcional)"
          value={nomeLista}
          onChange={e => setNomeLista(e.target.value)}
        />
        <textarea
          className="w-full border rounded p-2"
          rows={4}
          placeholder={"+258849191742\n+351912345678\n(um por linha ou separados por vírgula)"}
          value={texto}
          onChange={e => setTexto(e.target.value)}
        />
        <button
          onClick={adicionarManual}
          disabled={!texto.trim()}
          className="px-4 py-2 bg-black text-white rounded disabled:opacity-40"
        >
          Guardar lista
        </button>
      </section>

      <section className="rounded-xl border p-5 space-y-3">
        <h2 className="font-semibold">Ler números de uma imagem</h2>
        <input type="file" accept="image/*" onChange={lerImagem} disabled={carregandoOcr} />
        {carregandoOcr && <p className="text-gray-500">A ler imagem...</p>}

        {preview && (
          <div className="space-y-2">
            <p>{preview.numeros.length} números reconhecidos:</p>
            <ul className="text-sm max-h-48 overflow-y-auto border rounded divide-y">
              {preview.numeros.map((n, i) => (
                <li key={i} className="flex justify-between items-center px-3 py-1.5">
                  <span>{n.formatado} <span className="text-gray-400">({n.pais})</span></span>
                  <button onClick={() => removerDoPreview(i)} className="text-red-500 text-xs">
                    remover
                  </button>
                </li>
              ))}
            </ul>
            {preview.invalidos?.length > 0 && (
              <p className="text-xs text-gray-400">
                {preview.invalidos.length} sequência(s) ignorada(s) por não parecerem números válidos.
              </p>
            )}
            <button
              onClick={confirmarPreview}
              disabled={preview.numeros.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-40"
            >
              Confirmar e guardar
            </button>
          </div>
        )}
      </section>

      <section className="rounded-xl border p-5">
        <h2 className="font-semibold mb-3">Listas guardadas</h2>
        {listas.length === 0 && <p className="text-gray-400 text-sm">Ainda não tens listas.</p>}
        {listas.map(l => (
          <div key={l.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
            <span>
              {l.nome} — <strong>{l.total}</strong> números
              <span className="text-gray-400"> ({l.origem})</span>
            </span>
            <div className="flex gap-3">
              <button onClick={() => copiarLista(l.id)} className="text-sm underline">
                Copiar
              </button>
              <button onClick={() => apagarLista(l.id)} className="text-sm text-red-500 underline">
                Apagar
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
