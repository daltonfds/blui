import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [sessao, setSessao] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;

    async function restaurarSessao() {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('[AUTH] getSession:', error);
        }

        if (!ativo) return;

        let sessaoAtual = data?.session || null;

        // Se existir sessão, garante que o token ainda é utilizável.
        if (sessaoAtual?.access_token) {
          const expiracao = sessaoAtual.expires_at || 0;
          const agora = Math.floor(Date.now() / 1000);

          if (expiracao && expiracao - agora < 120) {
            const renovacao = await supabase.auth.refreshSession();

            if (!renovacao.error && renovacao.data?.session) {
              sessaoAtual = renovacao.data.session;
            }
          }
        }

        if (ativo) {
          setSessao(sessaoAtual);
          setCarregando(false);
        }
      } catch (error) {
        console.error('[AUTH] restauração:', error);

        if (ativo) {
          setSessao(null);
          setCarregando(false);
        }
      }
    }

    restaurarSessao();

    const { data: assinatura } = supabase.auth.onAuthStateChange(
      async (_evento, novaSessao) => {
        if (!ativo) return;

        setSessao(novaSessao);

        // Mantém o estado de carregamento encerrado somente
        // depois que o Supabase informar a sessão.
        setCarregando(false);
      }
    );

    return () => {
      ativo = false;
      assinatura?.subscription?.unsubscribe();
    };
  }, []);

  async function entrar(email, senha) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) throw error;

    setSessao(data?.session || null);
    return data;
  }

  async function registar(email, senha, nome) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: { nome },
      },
    });

    if (error) throw error;

    setSessao(data?.session || null);
    return data;
  }

  async function sair() {
    await supabase.auth.signOut();
    setSessao(null);
  }

  return (
    <AuthContext.Provider
      value={{
        sessao,
        carregando,
        entrar,
        registar,
        sair,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
