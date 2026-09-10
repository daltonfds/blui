import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function RotaProtegida({
  children,
  ignorarAssinatura = false,
}) {
  const { sessao, carregando } = useAuth();
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    if (carregando) return;

    setVerificando(false);
  }, [carregando, sessao]);

  if (carregando || verificando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-fog">
        <div className="text-sm text-base-ink/60">
          A verificar a tua conta...
        </div>
      </div>
    );
  }

  if (!sessao?.user?.id) {
    return <Navigate to="/entrar" replace />;
  }

  return children;
}
