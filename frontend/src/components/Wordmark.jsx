import React from 'react';
import AnimatedLogo from './AnimatedLogo.jsx';

export default function Wordmark({ tamanho = 'text-xl', animar = false }) {
  return (
    <div className="flex items-center gap-2.5">
      <AnimatedLogo tamanho={30} animar={animar} />
      <span className={`${tamanho} font-semibold tracking-tight text-base-ink`}>blui</span>
    </div>
  );
}
