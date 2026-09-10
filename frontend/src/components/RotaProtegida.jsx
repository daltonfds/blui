import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/api.js';

export default function RotaProtegida({
  children,
  ignorarAssinatura = false,
}) {
  const { sessao, carregando } = useAuth();

  const [verificando, setVerificando] = useState(true);
  const [acessoLiberado, setAcessoLiberado] = useState(false);
  const [motivoBloqueio, setMotivoBloqueio] = useState(null);

  useEffect(() => {
    if (carregando) return;

    if (!sessao?.user?.id) {
      setVerificando(false);
      setAcessoLiberado(false);
      return;
    }

    if (ignorarAssinatura) {
      setAcessoLiberado(true);
      setVerificando(false);
      return;
    }

    let cancelado = false;

    async function verificar() {
      setVerificando(true);
      setMotivoBloqueio(null);

      try {
        // A assinatura é validada pelo backend autenticado.
        const assinatura = await api.get('/api/assinaturas/minha');

        if (!assinatura) {
          if (!cancelado) {
            setMotivoBloqueio({
              tipo: 'sem_assinatura',
              mensagem:
                'Ainda não tens nenhum plano ativo. Escolhe um plano para continuar.',
            });
            setAcessoLiberado(false);
          }
          return;
        }

        const agora = new Date();
        const fim = assinatura.ciclo_fim
          ? new Date(assinatura.ciclo_fim)
          : null;

        const cicloValido =
          fim &&
          !Number.isNaN(fim.getTime()) &&
          fim.getTime() > agora.getTime();

        if (assinatura.estado !== 'ativa') {
          if (!cancelado) {
            setMotivoBloqueio({
              tipo: 'pendente',
              mensagem: `O teu pedido do plano ${
                assinatura.planos?.nome || ''
              } está a aguardar aprovação.`,
            });
            setAcessoLiberado(false);
          }
          return;
        }

        if (!cicloValido) {
          if (!cancelado) {
            setMotivoBloqueio({
              tipo: 'assinatura_expirada',
              mensagem: `O teu plano ${
                assinatura.planos?.nome || ''
              } expirou. Renova para continuar.`,
            });
            setAcessoLiberado(false);
          }
          return;
        }

        if (!cancelado) {
          setAcessoLiberado(true);
          setMotivoBloqueio(null);
        }

      } catch (erro) {
        console.error('Erro ao verificar assinatura:', erro);

        if (!cancelado) {
          setMotivoBloqueio({
            tipo: 'erro',
            mensagem:
              'Não foi possível verificar a tua assinatura. Tenta atualizar a página.',
          });
          setAcessoLiberado(false);
        }
      } finally {
        if (!cancelado) {
          setVerificando(false);
        }
      }
    }

    verificar();

    return () => {
      cancelado = true;
    };
  }, [sessao, carregando, ignorarAssinatura]);

  if (carregando || verificando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-fog">
        <div className="text-sm text-base-ink/60">
          A verificar a tua conta...
        </div>
      </div>
    );
  }

  if (!sessao) {
    return <Navigate to="/entrar" replace />;
  }

  if (!acessoLiberado && !ignorarAssinatura) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-fog p-6">
        <div className="w-full max-w-md rounded-lg border border-black/5 bg-base-white p-7 shadow-sm">
          <h1 className="text-xl font-semibold text-base-ink">
            Acesso bloqueado
          </h1>

          <p className="mt-3 text-sm leading-6 text-base-ink/65">
            {motivoBloqueio?.mensagem ||
              'A tua assinatura não permite acesso a esta área.'}
          </p>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-md px-4 py-2.5 text-sm font-medium bg-base-fog text-base-ink hover:opacity-80"
            >
              Atualizar
            </button>

            <button
              type="button"
              onClick={() => {
                window.location.href = '/assinatura';
              }}
              className="rounded-md px-4 py-2.5 text-sm font-medium bg-brand-600 text-white hover:opacity-90"
            >
              Ver assinatura
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
