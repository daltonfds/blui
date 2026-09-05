import React from 'react';
import { motion } from 'framer-motion';

// Marca: duas formas que se cruzam — uma conversa (balão) que se transforma
// num broto/folha (crescimento). Representa "conversa que vira conversão".
export default function AnimatedLogo({ tamanho = 40, animar = true }) {
  const caminho = {
    hidden: { pathLength: 0, opacity: 0 },
    show: { pathLength: 1, opacity: 1 },
  };

  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 48 48" fill="none">
      <motion.path
        d="M8 14.5C8 10.9 10.9 8 14.5 8h19C36.6 8 40 11.4 40 15.5v10c0 4.1-3.4 7.5-7.5 7.5H21l-7 6v-6h-1.5C8.9 33 6 30.1 6 26.5"
        stroke="#12140F"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={caminho}
        initial={animar ? 'hidden' : 'show'}
        animate="show"
        transition={{ duration: 1.1, ease: 'easeInOut' }}
      />
      <motion.path
        d="M24 21c0 4.4-3.1 8-7 9.4 3.9 1.4 7 5 7 9.4"
        stroke="#1FAE64"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={caminho}
        initial={animar ? 'hidden' : 'show'}
        animate="show"
        transition={{ duration: 0.9, ease: 'easeInOut', delay: 0.55 }}
      />
      <motion.circle
        cx="24" cy="21" r="2.6"
        fill="#1FAE64"
        initial={animar ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 1.35 }}
      />
    </svg>
  );
}
