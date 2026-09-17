import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function NavigationBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const historyIndex = window.history.state?.idx;
  const podeVoltar = typeof historyIndex === 'number'
    ? historyIndex > 0
    : window.history.length > 1;

  function voltar() {
    if (podeVoltar) {
      navigate(-1);
      return;
    }

    if (location.pathname !== '/painel') {
      navigate('/painel', { replace: true });
    }
  }

  return (
    <div className="blui-navigation-bar">
      <button
        type="button"
        onClick={voltar}
        disabled={!podeVoltar && location.pathname === '/painel'}
        className="blui-back-button"
        aria-label="Voltar"
        title="Voltar"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5" />
          <path d="M12 19l-7-7 7-7" />
        </svg>

        <span>Voltar</span>
      </button>
    </div>
  );
}
