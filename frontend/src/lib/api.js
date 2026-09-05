import { supabase } from './supabaseClient.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

async function pedido(caminho, opcoes = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const resposta = await fetch(`${API_URL}${caminho}`, {
    ...opcoes,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opcoes.headers || {}),
    },
  });

  const corpo = await resposta.json().catch(() => ({}));
  if (!resposta.ok) throw new Error(corpo.erro || 'Erro no pedido.');
  return corpo;
}

export const api = {
  get: (caminho) => pedido(caminho),
  post: (caminho, dados) => pedido(caminho, { method: 'POST', body: JSON.stringify(dados) }),
  put: (caminho, dados) => pedido(caminho, { method: 'PUT', body: JSON.stringify(dados) }),
  patch: (caminho, dados) => pedido(caminho, { method: 'PATCH', body: JSON.stringify(dados) }),
  del: (caminho) => pedido(caminho, { method: 'DELETE' }),
};
