import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function RotaProtegida({
  children,
  ignorarAssinatura = false,
}) {
  const { sessao, carregando } = useAuth();

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-fog">
        <div className="text-sm text-base-ink/60">
          A verificar a tua conta...
        </div>
      </div>
    );
  }

  if (!sessao?.user?.id || !sessao?.access_token) {
    return <Navigate to="/entrar" replace />;
  }

  return children;
}
