import { supabase } from './supabaseClient.js';

const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? 'http://localhost:4000'
    : 'https://blui-backend.onrender.com');

async function obterToken() {
  // Primeiro tenta obter a sessão atual.
  let resultado = await supabase.auth.getSession();

  if (resultado.error) {
    console.warn('[API] getSession:', resultado.error.message);
  }

  let session = resultado.data?.session || null;

  if (!session) {
    // Dá uma pequena oportunidade ao Supabase de restaurar
    // a sessão persistida antes de desistir.
    await new Promise(resolve => setTimeout(resolve, 150));

    resultado = await supabase.auth.getSession();
    session = resultado.data?.session || null;
  }

  if (!session) {
    return null;
  }

  const agora = Math.floor(Date.now() / 1000);
  const expiresAt = session.expires_at || 0;

  // Renova antecipadamente.
  if (expiresAt && expiresAt - agora < 120) {
    const renovacao = await supabase.auth.refreshSession();

    if (!renovacao.error && renovacao.data?.session) {
      session = renovacao.data.session;
    }
  }

  return session?.access_token || null;
}

async function pedido(caminho, opcoes = {}, tentarNovamente = true) {
  let token = await obterToken();

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

  // Token expirado ou rejeitado pelo backend:
  // renova e repete a mesma operação uma única vez.
  if (resposta.status === 401 && tentarNovamente) {
    const renovacao = await supabase.auth.refreshSession();

    if (!renovacao.error && renovacao.data?.session) {
      token = renovacao.data.session.access_token;

      return pedido(
        caminho,
        {
          ...opcoes,
          headers: {
            ...(opcoes.headers || {}),
            Authorization: `Bearer ${token}`,
          },
        },
        false
      );
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
