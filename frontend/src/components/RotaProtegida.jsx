import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { supabase } from '../lib/supabaseClient.js';
import { api } from '../lib/api.js';

export default function RotaProtegida({ children }) {
  const { sessao, carregando } = useAuth();
  const [verificando, setVerificando] = useState(true);
  const [acessoLiberado, setAcessoLiberado] = useState(false);
  const [motivoBloqueio, setMotivoBloqueio] = useState(null);

  useEffect(() => {
    if (!sessao) {
      setVerificando(false);
      return;
    }

    let cancelado = false;

    async function verificar() {
      setVerificando(true);
      try {
        const { data: admin } = await supabase.rpc('is_admin');
        if (admin) {
          if (!cancelado) { setAcessoLiberado(true); setVerificando(false); }
          return;
        }

        const assinatura = await api.get('/api/assinaturas/minha');

        if (!assinatura) {
          if (!cancelado) {
            setMotivoBloqueio({ tipo: 'sem_assinatura', mensagem: 'Ainda não tens nenhum plano ativo. Escolhe um plano para continuar.' });
            setAcessoLiberado(false);
          }
          return;
        }

        const venceu = new Date(assinatura.ciclo_fim) < new Date();
        const bloqueada = assinatura.estado !== 'ativa' || venceu;

        if (bloqueada) {
          if (!cancelado) {
            setMotivoBloqueio({
              tipo: 'assinatura_expirada',
              mensagem: `O teu plano ${assinatura.planos?.nome || ''} expirou. Renova para continuar.`,
            });
            setAcessoLiberado(false);
          }
        } else if (!cancelado) {
          setAcessoLiberado(true);
        }
      } catch (e) {
        if (!cancelado) {
          setMotivoBloqueio({ tipo: 'erro', mensagem: 'Não foi possível verificar a tua assinatura.' });
          setAcessoLiberado(false);
        }
      } finally {
        if (!cancelado) setVerificando(false);
      }
    }

    verificar();
    return () => { cancelado = true; };
  }, [sessao]);

  if (carregando || verificando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-fog">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!sessao) return <Navigate to="/entrar" replace />;

  if (!acessoLiberado) {
    return <AssinaturaBloqueada motivo={motivoBloqueio} />;
  }

  return children;
}

function AssinaturaBloqueada({ motivo }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-fog px-6">
      <div className="bg-base-white border border-black/5 rounded-xs p-8 max-w-md text-center">
        <h1 className="text-xl font-semibold text-base-ink mb-2">
          {motivo?.tipo === 'sem_assinatura' ? 'Escolhe um plano para continuar' : 'A tua assinatura expirou'}
        </h1>
        <p className="text-sm text-base-ink/60 mb-6">{motivo?.mensagem}</p>
        <a
          href="/definicoes"
          className="inline-block bg-brand-500 text-base-white text-sm font-medium px-5 py-2.5 rounded-xs hover:bg-brand-600 transition-colors"
        >
          Ver planos
        </a>
      </div>
    </div>
  );
}
