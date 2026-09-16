import { supabase } from './supabaseClient.js';

const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? 'http://localhost:4000'
    : 'https://blui-backend.onrender.com');

async function obterToken() {
  let { data, error } = await supabase.auth.getSession();

  if (error) throw error;

  let session = data?.session;

  if (!session) {
    return null;
  }

  const expiresAt = session.expires_at || 0;
  const agora = Math.floor(Date.now() / 1000);

  if (expiresAt && expiresAt - agora < 120) {
    const renovacao = await supabase.auth.refreshSession();

    if (!renovacao.error && renovacao.data?.session) {
      session = renovacao.data.session;
    }
  }

  return session?.access_token || null;
}

async function pedido(caminho, opcoes = {}, tentarNovamente = true) {
  const token = await obterToken();

  if (!token) {
    throw new Error('Sessão não encontrada. Entre novamente no BLUI.');
  }

  const resposta = await fetch(`${API_URL}${caminho}`, {
    ...opcoes,
    headers: {
      ...(opcoes.body instanceof FormData
        ? {}
        : { 'Content-Type': 'application/json' }),
      Authorization: `Bearer ${token}`,
      ...(opcoes.headers || {}),
    },
  });

  const corpo = await resposta.json().catch(() => ({}));

  if (resposta.status === 401 && tentarNovamente) {
    const renovacao = await supabase.auth.refreshSession();

    if (!renovacao.error && renovacao.data?.session) {
      return pedido(caminho, opcoes, false);
    }
  }

  if (!resposta.ok) {
    throw new Error(corpo.erro || 'Erro no pedido.');
  }

  return corpo;
}

async function download(caminho, nomeArquivo = 'download') {
  const token = await obterToken();

  if (!token) {
    throw new Error('Sessão não encontrada. Entre novamente no BLUI.');
  }

  const resposta = await fetch(`${API_URL}${caminho}`, {
    headers: {
      Authorization: `Bearer ${token}`,
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
      body: dados instanceof FormData ? dados : JSON.stringify(dados),
    }),

  put: (caminho, dados) =>
    pedido(caminho, {
      method: 'PUT',
      body: dados instanceof FormData ? dados : JSON.stringify(dados),
    }),

  patch: (caminho, dados) =>
    pedido(caminho, {
      method: 'PATCH',
      body: dados instanceof FormData ? dados : JSON.stringify(dados),
    }),

  del: (caminho) =>
    pedido(caminho, {
      method: 'DELETE',
    }),

  download,
};
