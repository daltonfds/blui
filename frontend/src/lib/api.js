import { supabase } from './supabaseClient.js';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:4000' : 'https://blui-backend.onrender.com');

async function obterToken() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.access_token;
}

async function pedido(caminho, opcoes = {}) {
  const token = await obterToken();

  const resposta = await fetch(`${API_URL}${caminho}`, {
    ...opcoes,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opcoes.headers || {}),
    },
  });

  const corpo = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    throw new Error(corpo.erro || 'Erro no pedido.');
  }

  return corpo;
}

async function download(caminho, nomeArquivo = 'download') {
  const token = await obterToken();

  const resposta = await fetch(`${API_URL}${caminho}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!resposta.ok) {
    const corpo = await resposta.json().catch(() => ({}));
    throw new Error(corpo.erro || 'Erro no download.');
  }

  const blob = await resposta.blob();
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

export const api = {
  get: (caminho) => pedido(caminho),

  post: (caminho, dados) =>
    pedido(caminho, {
      method: 'POST',
      body: JSON.stringify(dados),
    }),

  put: (caminho, dados) =>
    pedido(caminho, {
      method: 'PUT',
      body: JSON.stringify(dados),
    }),

  patch: (caminho, dados) =>
    pedido(caminho, {
      method: 'PATCH',
      body: JSON.stringify(dados),
    }),

  del: (caminho) =>
    pedido(caminho, {
      method: 'DELETE',
    }),

  download,
};
