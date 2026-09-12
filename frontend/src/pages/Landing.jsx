import React from 'react';

function BadgeLogo() {
  return (
    <div className="inline-flex items-center gap-2 bg-white rounded-full pl-3 pr-4 py-2 shadow-sm border border-black/5">
      <svg width={20} height={20} viewBox="0 0 64 64" fill="none">
        <defs>
          <linearGradient id="bluiGradBadge" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#22B8FF" /><stop offset="1" stopColor="#7C3AED" />
          </linearGradient>
        </defs>
        <path d="M14 4c5.5 0 10 4.5 10 10v14a18 18 0 1 1-10 22V4z" fill="url(#bluiGradBadge)" />
        <circle cx="30" cy="40" r="13" fill="white" />
        <circle cx="25" cy="40" r="1.8" fill="url(#bluiGradBadge)" /><circle cx="30" cy="40" r="1.8" fill="url(#bluiGradBadge)" /><circle cx="35" cy="40" r="1.8" fill="url(#bluiGradBadge)" />
      </svg>
      <span className="font-semibold text-[#1A1A1A] text-[15px]">blui</span>
    </div>
  );
}

function GraficoLinha() {
  const pontos = [4, 6, 5, 9, 8, 14, 12, 20, 26];
  const max = Math.max(...pontos);
  const largura = 460, altura = 110;
  const passo = largura / (pontos.length - 1);
  const coords = pontos.map((v, i) => [i * passo, altura - (v / max) * (altura - 14) - 6]);
  const linha = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ');
  return (
    <svg viewBox={`0 0 ${largura} ${altura}`} className="w-full h-auto overflow-visible">
      <path d={linha} fill="none" stroke="#E8622C" strokeWidth="3" strokeLinecap="round" />
      <circle cx={coords[coords.length - 1][0]} cy={coords[coords.length - 1][1]} r="5" fill="#E8622C" />
    </svg>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen" style={{ background: '#F6EFE6' }}>
      <style>{`
        .blui-font-display { font-family: 'Poppins', 'Segoe UI Rounded', system-ui, sans-serif; letter-spacing: -0.02em; }
      `}</style>

      <header className="max-w-5xl mx-auto flex items-center justify-between px-6 py-6">
        <BadgeLogo />
        <div className="flex items-center gap-3">
          <a href="/entrar" className="text-sm font-medium text-[#3a3a3a] hover:text-black transition-colors">Entrar</a>
          <a href="/registar" className="bg-[#E8622C] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#d1541f] transition-colors">
            Começar agora
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="max-w-5xl mx-auto px-6 pt-10 pb-16 text-center">
        <div className="flex items-center justify-center gap-3 mb-6 text-xs font-semibold tracking-widest text-[#8a7a68] uppercase">
          <span className="bg-[#EFD9BE] text-[#8a4a1f] px-2.5 py-1 rounded-full">Atendimento</span>
          <span>Que transforma conversa em venda fechada</span>
        </div>

        <h1 className="blui-font-display text-5xl sm:text-6xl font-bold text-[#1A1A1A] leading-[1.05] max-w-3xl mx-auto">
          Para de vender<br />
          <span className="bg-gradient-to-r from-[#1A1A1A] to-[#9a9a9a] bg-clip-text text-transparent">no escuro.</span>
        </h1>

        <p className="mt-6 text-lg text-[#5a5a5a] max-w-xl mx-auto">
          A BLUI atende no WhatsApp, Messenger e Instagram, lembra-se de cada contacto e persegue quem
          desapareceu — antes que se torne uma venda perdida para sempre.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-5">
          <a href="/registar" className="bg-[#E8622C] text-white font-semibold px-8 py-3.5 rounded-full hover:bg-[#d1541f] transition-colors inline-flex items-center gap-2">
            Ativar a BLUI
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
          </a>
          <a href="/entrar" className="text-sm font-medium text-[#5a5a5a] hover:text-black transition-colors">Já tenho conta</a>
        </div>
      </section>

      {/* STATS reais do produto */}
      <section className="border-t border-b border-black/5 bg-[#EFE6D8]">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <p className="text-center text-xs font-semibold tracking-widest text-[#8a7a68] uppercase mb-8">Como o remarketing da BLUI funciona</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {[
              { valor: '3', label: 'Canais numa só caixa' },
              { valor: '24H', label: 'Primeiro follow-up automático' },
              { valor: '7 DIAS', label: 'Novo ciclo de remarketing' },
              { valor: '24/7', label: 'Suporte e agente sempre ativos' },
            ].map((s) => (
              <div key={s.label}>
                <p className="blui-font-display text-3xl sm:text-4xl font-bold text-[#1A1A1A]">{s.valor}</p>
                <p className="text-xs text-[#8a7a68] mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CARDS coloridos */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="grid sm:grid-cols-2 gap-5">
          <div className="rounded-3xl p-7" style={{ background: '#F2E2CE' }}>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-8 rounded-full bg-[#6D5FD8] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="3" y="4" width="18" height="14" rx="2" /><path d="M3 8h18" /></svg>
              </span>
              <span className="bg-[#DDEDD9] text-[#3f7a3a] text-xs font-semibold px-2.5 py-1 rounded-full">segmentação real</span>
            </div>
            <h3 className="blui-font-display text-2xl font-bold text-[#1A1A1A] mb-2">Receita, não conversas.</h3>
            <p className="text-sm text-[#5a5a5a] mb-4">Cada contacto fica ligado ao valor que gerou — sabes exatamente quem paga e quem só conversa.</p>
            <GraficoLinha />
          </div>

          <div className="rounded-3xl p-7 text-white flex flex-col justify-between" style={{ background: '#E8622C' }}>
            <div>
              <div className="w-10 h-1.5 rounded-full bg-white/40 mb-4" />
              <h3 className="blui-font-display text-2xl font-bold mb-2">24h → 7 dias</h3>
              <p className="text-sm text-white/85">O ciclo de remarketing por produto que recupera quem não comprou à primeira, sem precisares de lembrar manualmente.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SEGUNDA HERO - problema */}
      <section className="max-w-4xl mx-auto px-6 pb-24 text-center">
        <p className="text-xs font-semibold tracking-widest text-[#8a7a68] uppercase mb-4">O problema que ninguém te mostra</p>
        <h2 className="blui-font-display text-4xl sm:text-5xl font-bold text-[#1A1A1A] leading-tight">
          Os leads chegam.<br />Os clientes, não.
        </h2>
        <p className="mt-6 text-[#5a5a5a] max-w-lg mx-auto">
          Recebes mensagens todos os dias. Mas sem memória, sem follow-up e sem dados, a maior parte
          fica só numa conversa que nunca chega a lado nenhum.
        </p>
        <div className="mt-8 space-y-3 max-w-md mx-auto text-left">
          {[
            'Perguntou o preço e nunca mais respondeu.',
            'Ninguém se lembrou de voltar a contactar.',
            'Não há dados para saber o que realmente converte.',
          ].map((linha) => (
            <div key={linha} className="flex items-start gap-3">
              <span className="w-4 h-0.5 bg-[#E8622C] mt-2.5 shrink-0" />
              <span className="text-sm text-[#3a3a3a]">{linha}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="max-w-3xl mx-auto px-6 pb-24 text-center">
        <div className="rounded-3xl p-10" style={{ background: '#1A1A1A' }}>
          <h2 className="blui-font-display text-3xl font-bold text-white mb-3">Começa a recuperar vendas hoje.</h2>
          <p className="text-white/60 mb-7">Sem contratos longos. Começa a partir de R$5.</p>
          <a href="/registar" className="bg-[#E8622C] text-white font-semibold px-8 py-3.5 rounded-full hover:bg-[#d1541f] transition-colors inline-flex items-center gap-2">
            Ativar a BLUI
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
          </a>
        </div>
      </section>

      <footer className="border-t border-black/5">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <BadgeLogo />
          <div className="flex gap-6 text-sm text-[#5a5a5a]">
            <a href="mailto:contact@blui.online" className="hover:text-black transition-colors">contact@blui.online</a>
            <a href="https://wa.me/27722958915" target="_blank" rel="noreferrer" className="hover:text-black transition-colors">+27 72 295 8915</a>
            <a href="https://instagram.com/dalton_fds" target="_blank" rel="noreferrer" className="hover:text-black transition-colors">Instagram</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
