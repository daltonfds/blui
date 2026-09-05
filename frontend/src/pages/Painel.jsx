import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import LayoutApp from '../components/LayoutApp.jsx';
import { api } from '../lib/api.js';
import { IconPeople, IconClock, IconCheck, IconChat } from '../components/Icons.jsx';

const CARTOES = [
  { chave: 'novo', label: 'Novos', Icon: IconChat, cor: 'text-base-ink' },
  { chave: 'conversando', label: 'Em conversa', Icon: IconChat, cor: 'text-base-ink' },
  { chave: 'pendente', label: 'Pendentes', Icon: IconClock, cor: 'text-signal-red' },
  { chave: 'comprou', label: 'Compraram', Icon: IconCheck, cor: 'text-brand-600' },
];

export default function Painel() {
  const [resumo, setResumo] = useState(null);
  const [sugestoes, setSugestoes] = useState(null);

  useEffect(() => {
    api.get('/api/contactos/resumo').then(setResumo).catch(() => {});
    api.get('/api/sugestoes').then(setSugestoes).catch(() => {});
  }, []);

  return (
    <LayoutApp>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-base-ink">Painel</h1>
          <p className="text-sm text-base-ink/55 mt-1">Visão geral dos teus contactos e conversas.</p>
        </div>
        <div className="flex items-center gap-2 text-sm bg-base-white border border-black/5 rounded-xs px-4 py-2">
          <IconPeople className="text-base-ink/40" />
          <span className="text-base-ink/60">Total</span>
          <span className="font-semibold text-base-ink">{resumo?.total ?? '—'}</span>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {CARTOES.map(({ chave, label, Icon, cor }, i) => (
          <motion.div
            key={chave}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.05 }}
            className="bg-base-white border border-black/5 rounded-xs p-5"
          >
            <div className={`w-8 h-8 rounded-xs bg-base-fog flex items-center justify-center ${cor}`}>
              <Icon />
            </div>
            <p className="mt-4 text-2xl font-semibold text-base-ink">
              {resumo?.resumo?.[chave] ?? 0}
            </p>
            <p className="text-sm text-base-ink/55 mt-0.5">{label}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 bg-base-white border border-black/5 rounded-xs p-6">
        <h2 className="font-medium text-base-ink">Sugestões de melhoria</h2>
        {sugestoes && !sugestoes.liberado && (
          <div className="mt-4">
            <div className="h-2 bg-base-fog rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-500 transition-all"
                style={{ width: `${Math.min(100, (sugestoes.contactos_atual / sugestoes.contactos_necessarios) * 100)}%` }}
              />
            </div>
            <p className="text-sm text-base-ink/55 mt-3">{sugestoes.mensagem}</p>
          </div>
        )}
        {sugestoes?.liberado && sugestoes.sugestoes.length === 0 && (
          <p className="text-sm text-base-ink/55 mt-3">
            Já tens contactos suficientes — as sugestões vão aparecer aqui assim que houver padrões relevantes.
          </p>
        )}
        {sugestoes?.liberado && sugestoes.sugestoes.length > 0 && (
          <ul className="mt-4 space-y-3">
            {sugestoes.sugestoes.map((s) => (
              <li key={s.id} className="border border-black/5 rounded-xs p-4">
                <p className="text-sm font-medium text-base-ink">{s.titulo}</p>
                <p className="text-sm text-base-ink/55 mt-1">{s.descricao}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </LayoutApp>
  );
}
