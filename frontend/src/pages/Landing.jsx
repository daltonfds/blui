import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Wordmark from '../components/Wordmark.jsx';
import { IconChat, IconClock, IconChart, IconBolt, IconTarget, IconArrowRight, IconCheck } from '../components/Icons.jsx';

const recursos = [
  {
    Icon: IconChat,
    titulo: 'Memória por contacto',
    texto: 'Cada número tem uma ficha própria: o que já foi dito, o que falta perguntar, o que já foi respondido — em WhatsApp, Messenger ou Instagram.',
  },
  {
    Icon: IconClock,
    titulo: 'Remarketing no tempo certo',
    texto: '24 horas sem resposta, envia o argumento certo. Sete dias sem compra, reabre a conversa do zero — sem intervenção manual.',
  },
  {
    Icon: IconTarget,
    titulo: 'Segmentação real',
    texto: 'Quem comprou, quem ficou a meio, quem nunca respondeu — tudo separado, pronto para copiar ou alimentar diretamente um anúncio.',
  },
  {
    Icon: IconChart,
    titulo: 'Dados que sobrevivem ao bloqueio',
    texto: 'Os eventos de compra chegam ao Meta, Google e às outras plataformas mesmo quando o cookie do browser falha.',
  },
  {
    Icon: IconBolt,
    titulo: 'Campanhas por conta própria',
    texto: 'Liga a conta de anúncios e o sistema monta a campanha, o público e o criativo com base em quem já comprou.',
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-base-white">
      <header className="border-b border-black/5">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <Wordmark animar />
          <div className="flex items-center gap-3">
            <Link to="/entrar" className="text-sm font-medium text-base-ink/70 hover:text-base-ink px-3 py-2">
              Entrar
            </Link>
            <Link
              to="/registar"
              className="text-sm font-medium bg-base-ink text-base-white px-4 py-2 rounded-xs hover:bg-brand-900 transition-colors"
            >
              Criar conta
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-[1.08] text-base-ink">
            Cada conversa fica na memória.
            <br />
            <span className="text-brand-600">Cada cliente fica no seu lugar.</span>
          </h1>
          <p className="mt-6 text-base text-base-ink/65 max-w-md leading-relaxed">
            O Blui atende no WhatsApp, Messenger e Instagram, lembra-se de cada contacto pelo número,
            reabre conversas paradas e mostra exatamente quem comprou, quem está pendente e quem já não responde.
          </p>
          <div className="mt-9 flex items-center gap-4">
            <Link
              to="/registar"
              className="inline-flex items-center gap-2 bg-brand-500 text-base-white text-sm font-medium px-5 py-3 rounded-xs hover:bg-brand-600 transition-colors"
            >
              Começar agora
              <IconArrowRight />
            </Link>
            <Link to="/entrar" className="text-sm font-medium text-base-ink/70 hover:text-base-ink">
              Já tenho conta
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="relative"
        >
          <div className="rounded-xs border border-black/5 bg-base-white shadow-card p-5">
            <div className="flex items-center justify-between pb-4 border-b border-black/5">
              <span className="text-sm font-medium text-base-ink/60">Contactos — hoje</span>
              <span className="text-xs text-brand-600 font-medium">+100 esta semana</span>
            </div>
            <ul className="mt-4 space-y-3">
              {[
                { nome: '+258 84 •• •• 12', estado: 'Comprou', cor: 'text-brand-600' },
                { nome: '+258 82 •• •• 47', estado: 'Pendente', cor: 'text-signal-red' },
                { nome: '+258 87 •• •• 03', estado: 'Conversando', cor: 'text-base-ink/60' },
              ].map((linha) => (
                <li key={linha.nome} className="flex items-center justify-between text-sm">
                  <span className="text-base-ink/80">{linha.nome}</span>
                  <span className={`font-medium ${linha.cor}`}>{linha.estado}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="absolute -bottom-5 -right-5 bg-base-ink text-base-white rounded-xs px-4 py-3 shadow-card">
            <p className="text-2xl font-semibold">24h</p>
            <p className="text-xs text-base-white/60">até ao remarketing</p>
          </div>
        </motion.div>
      </section>

      {/* RECURSOS */}
      <section className="border-t border-black/5 bg-base-fog">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-2xl font-semibold text-base-ink max-w-lg">
            Tudo o que um negócio de vendas por conversa precisa, num só lugar.
          </h2>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recursos.map(({ Icon, titulo, texto }) => (
              <div key={titulo} className="bg-base-white border border-black/5 rounded-xs p-6">
                <div className="w-9 h-9 rounded-xs bg-brand-50 text-brand-600 flex items-center justify-center">
                  <Icon />
                </div>
                <h3 className="mt-4 font-medium text-base-ink">{titulo}</h3>
                <p className="mt-2 text-sm text-base-ink/60 leading-relaxed">{texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROVA / GARANTIA DE DECISÃO */}
      <section className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-10 items-start">
        <div>
          <h2 className="text-2xl font-semibold text-base-ink">Sugestões só quando fazem sentido.</h2>
          <p className="mt-4 text-base-ink/65 leading-relaxed max-w-md">
            O painel de melhorias só se abre depois de reunir pelo menos 100 contactos reais — nada de
            recomendações tiradas de uma amostra pequena demais para significar alguma coisa.
          </p>
        </div>
        <ul className="space-y-4">
          {[
            'Um número de telefone, um histórico completo',
            'Reinício automático da conversa aos 7 dias',
            'Exportação simples para segmentar anúncios',
            'Ligação direta ao Meta Ads a partir do painel',
          ].map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm text-base-ink/75">
              <span className="mt-0.5 text-brand-600"><IconCheck /></span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      <footer className="border-t border-black/5">
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between">
          <Wordmark tamanho="text-sm" />
          <p className="text-xs text-base-ink/40">© {new Date().getFullYear()} Blui</p>
        </div>
      </footer>
    </div>
  );
}
