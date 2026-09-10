import React from 'react';
import { Link } from 'react-router-dom';

function LogoBlui({ tamanho = 40, escuro = false }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg width={tamanho} height={tamanho} viewBox="0 0 64 64" fill="none">
        <defs>
          <linearGradient id="bluiGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#22B8FF" />
            <stop offset="1" stopColor="#7C3AED" />
          </linearGradient>
        </defs>
        <path d="M14 4c5.5 0 10 4.5 10 10v14a18 18 0 1 1-10 22V4z" fill="url(#bluiGrad)" />
        <circle cx="30" cy="40" r="13" fill="white" />
        <circle cx="25" cy="40" r="1.8" fill="url(#bluiGrad)" />
        <circle cx="30" cy="40" r="1.8" fill="url(#bluiGrad)" />
        <circle cx="35" cy="40" r="1.8" fill="url(#bluiGrad)" />
      </svg>
      <span className={`text-2xl font-bold tracking-tight ${escuro ? 'text-base-white' : 'text-base-ink'}`}>blui</span>
    </div>
  );
}

const iconProps = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };
const IconInbox = () => (<svg {...iconProps}><path d="M3 12h4l2 3h6l2-3h4" /><path d="M5 12 3 5h18l-2 7" /><path d="M3 12v6a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-6" /></svg>);
const IconMemoria = () => (<svg {...iconProps}><circle cx="12" cy="12" r="3.2" /><path d="M12 4v2.5M12 17.5V20M4 12h2.5M17.5 12H20M6.3 6.3l1.8 1.8M15.9 15.9l1.8 1.8M6.3 17.7l1.8-1.8M15.9 8.1l1.8-1.8" /></svg>);
const IconCiclo = () => (<svg {...iconProps}><path d="M4 12a8 8 0 0 1 13.5-5.8M20 12a8 8 0 0 1-13.5 5.8" /><path d="M17.5 3v3.5H14M6.5 21v-3.5H10" /></svg>);
const IconMegafone = () => (<svg {...iconProps}><path d="M3 10v4a1 1 0 0 0 1 1h2l7 4V5L6 9H4a1 1 0 0 0-1 1Z" /><path d="M17 9a4 4 0 0 1 0 6M20 6a8 8 0 0 1 0 12" /></svg>);
const IconGrafico = () => (<svg {...iconProps}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></svg>);
const IconFecho = () => (<svg {...iconProps}><path d="M9 12.5 11 15l4.5-5.5" /><circle cx="12" cy="12" r="9.5" /></svg>);

function GrainOverlay() {
  return (
    <svg className="fixed inset-0 w-full h-full pointer-events-none opacity-[0.035] mix-blend-overlay z-40" aria-hidden="true">
      <filter id="bluiGrain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" /></filter>
      <rect width="100%" height="100%" filter="url(#bluiGrain)" />
    </svg>
  );
}

function GraficoHero() {
  const pontos = [8, 14, 12, 22, 19, 30, 27, 38, 44];
  const max = Math.max(...pontos);
  const largura = 460, altura = 130;
  const passo = largura / (pontos.length - 1);
  const coordenadas = pontos.map((v, i) => [i * passo, altura - (v / max) * (altura - 16) - 8]);
  const linha = coordenadas.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ');
  const area = `${linha} L${largura},${altura} L0,${altura} Z`;

  return (
    <svg viewBox={`0 0 ${largura} ${altura}`} className="w-full h-auto overflow-visible">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#22B8FF" stopOpacity="0.3" />
          <stop offset="1" stopColor="#22B8FF" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#22B8FF" />
          <stop offset="1" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#areaGrad)" className="blui-fade-up" style={{ animationDelay: '0.6s' }} />
      <path d={linha} fill="none" stroke="url(#lineGrad)" strokeWidth="2" strokeLinecap="round" pathLength="1000" className="blui-draw-line" />
      {coordenadas.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === coordenadas.length - 1 ? 4 : 2} fill={i === coordenadas.length - 1 ? '#22B8FF' : 'white'} fillOpacity={i === coordenadas.length - 1 ? 1 : 0.55} className={i === coordenadas.length - 1 ? 'blui-pulse-dot' : ''} />
      ))}
    </svg>
  );
}

function PainelMockup() {
  return (
    <div className="blui-fade-up relative" style={{ animationDelay: '0.35s' }}>
      <div className="bg-[#0B0F1A] border border-white/10 rounded-lg p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
            <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
            <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
          </div>
          <span className="text-[10px] tracking-widest text-white/30 uppercase">Painel · ilustrativo</span>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Conversas ativas', valor: '—' },
            { label: 'Follow-ups na fila', valor: '—' },
            { label: 'Conversão do funil', valor: '—' },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-white/5 rounded-md p-3">
              <p className="text-[10px] text-white/35 mb-1 leading-tight">{kpi.label}</p>
              <p className="text-lg font-semibold text-white">{kpi.valor}</p>
            </div>
          ))}
        </div>

        <div className="bg-white/[0.03] border border-white/5 rounded-md p-4">
          <p className="text-[10px] tracking-widest text-white/30 uppercase mb-3">Recuperação de oportunidades</p>
          <GraficoHero />
          <div className="mt-3 flex justify-between text-[10px] text-white/30">
            <span>Início</span><span>Follow-up 24h</span><span>Follow-up 7 dias</span>
          </div>
        </div>
      </div>
      <div className="blui-orb absolute -z-10 -bottom-10 -right-10 w-56 h-56 rounded-full bg-brand-500/30 blur-3xl" />
    </div>
  );
}

const BENTO = [
  { Icon: IconInbox, titulo: 'Um canal, três frentes', desc: 'WhatsApp, Messenger e Instagram geridos como uma única operação de vendas — sem alternar entre apps.', grande: true },
  { Icon: IconMemoria, titulo: 'Memória por contacto', desc: 'Cada conversa continua exatamente de onde parou.' },
  { Icon: IconCiclo, titulo: 'Remarketing por produto', desc: 'Recuperação automática às 24h, e novo ciclo aos 7 dias.' },
  { Icon: IconGrafico, titulo: 'Métricas que mandam', desc: 'Funil, conversão e receita por canal e produto, em tempo real, para a decisão deixar de ser instinto.', grande: true },
  { Icon: IconMegafone, titulo: 'Campanhas no Facebook Ads', desc: 'Segmentação construída a partir dos teus dados de conversão.' },
  { Icon: IconFecho, titulo: 'Do contacto ao pago', desc: 'A venda é seguida até ao fim, automaticamente.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-base-white relative">
      <GrainOverlay />
      <style>{`
        @keyframes bluiFadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes bluiFloat { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-16px) scale(1.04); } }
        @keyframes bluiDraw { from { stroke-dashoffset: 1000; } to { stroke-dashoffset: 0; } }
        @keyframes bluiPulse { 0%, 100% { opacity: 1; r: 4; } 50% { opacity: 0.5; r: 7; } }
        @keyframes bluiShadowPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(124,58,237,0.4), 0 0 22px 3px rgba(34,184,255,0.22); }
          50% { box-shadow: 0 0 0 9px rgba(124,58,237,0), 0 0 30px 8px rgba(34,184,255,0.38); }
        }
        .blui-fade-up { opacity: 0; animation: bluiFadeUp 0.7s cubic-bezier(.2,.7,.2,1) forwards; }
        .blui-orb { animation: bluiFloat 8s ease-in-out infinite; }
        .blui-draw-line { stroke-dasharray: 1000; stroke-dashoffset: 1000; animation: bluiDraw 1.6s ease-out forwards 0.3s; }
        .blui-pulse-dot { animation: bluiPulse 1.8s ease-in-out infinite; transform-origin: center; }
        .blui-cta-glow { animation: bluiShadowPulse 2.4s ease-in-out infinite; }
      `}</style>

      <header className="sticky top-0 z-30 backdrop-blur-md bg-base-white/70 border-b border-black/5">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-5">
          <LogoBlui />
          <div className="flex items-center gap-3">
            <Link to="/entrar" className="text-sm font-medium text-base-ink/70 hover:text-base-ink transition-colors">Entrar</Link>
            <Link to="/registar" className="bg-brand-500 text-base-white text-sm font-medium px-5 py-2.5 rounded-xs hover:bg-brand-600 transition-colors">
              Começar agora
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative bg-[#05070D] overflow-hidden">
        <div className="blui-orb absolute -top-32 -left-32 w-[30rem] h-[30rem] rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />
        <div className="blui-orb absolute -bottom-40 right-0 w-[32rem] h-[32rem] rounded-full bg-purple-600/20 blur-3xl pointer-events-none" style={{ animationDelay: '2.5s' }} />

        <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-24 grid lg:grid-cols-[1.1fr_0.9fr] gap-16 items-center">
          <div>
            <span className="blui-fade-up inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.15em] text-brand-400 uppercase mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
              Vendas · Automação · Inteligência de dados
            </span>
            <h1 className="blui-fade-up text-[2.75rem] sm:text-6xl font-bold text-base-white tracking-tight leading-[1.05]" style={{ animationDelay: '0.1s' }}>
              A tua concorrência não está a vencer-te.<br className="hidden sm:block" /> Está a recuperar os clientes que tu deixaste ir.
            </h1>
            <p className="blui-fade-up mt-7 text-lg text-base-white/50 max-w-lg leading-relaxed" style={{ animationDelay: '0.2s' }}>
              A BLUI transforma cada conversa no WhatsApp, Messenger e Instagram numa máquina de recuperação
              de vendas — a trabalhar sozinha, todos os dias, sem pausa.
            </p>
            <div className="blui-fade-up mt-10 flex flex-wrap items-center gap-5" style={{ animationDelay: '0.3s' }}>
              <Link to="/registar" className="blui-cta-glow bg-brand-500 text-base-white font-semibold px-8 py-3.5 rounded-xs hover:bg-brand-600 transition-colors">
                Ativar o sistema
              </Link>
              <Link to="/entrar" className="text-sm font-medium text-base-white/50 hover:text-base-white transition-colors">
                Já tenho conta →
              </Link>
            </div>
          </div>

          <PainelMockup />
        </div>
      </section>

      {/* AFIRMAÇÃO */}
      <section className="border-b border-black/5 bg-base-white">
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <p className="text-[11px] font-semibold tracking-[0.15em] text-brand-600 uppercase mb-4">A verdade sobre vendas</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-base-ink leading-tight tracking-tight">
            Não precisas de mais leads.<br />Precisas de deixar de perder os que já tens.
          </h2>
        </div>
      </section>

      {/* BENTO */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <p className="text-[11px] font-semibold tracking-[0.15em] text-brand-600 uppercase mb-3">O sistema</p>
        <h2 className="text-3xl sm:text-4xl font-bold text-base-ink mb-12 tracking-tight max-w-xl">
          Tudo o que uma operação de vendas séria precisa.
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[1fr]">
          {BENTO.map(({ Icon, titulo, desc, grande }, i) => (
            <div
              key={titulo}
              className={`blui-fade-up group border border-black/5 rounded-lg p-7 hover:border-brand-500/40 hover:shadow-xl transition-all duration-300 ${grande ? 'lg:col-span-2' : ''}`}
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              <div className="w-11 h-11 rounded-md bg-brand-50 text-brand-600 flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
                <Icon />
              </div>
              <h3 className="font-semibold text-lg text-base-ink mb-2 tracking-tight">{titulo}</h3>
              <p className="text-sm text-base-ink/55 leading-relaxed max-w-md">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="relative bg-[#05070D] py-28 overflow-hidden">
        <div className="blui-orb absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[38rem] h-[38rem] rounded-full bg-brand-500/15 blur-3xl pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-base-white leading-tight tracking-tight">
            Continua a perder clientes em silêncio.<br />Ou instala o sistema que os recupera por ti.
          </h2>
          <Link to="/registar" className="blui-cta-glow mt-10 inline-block bg-brand-500 text-base-white font-semibold px-8 py-3.5 rounded-xs hover:bg-brand-600 transition-colors">
            Ativar o sistema
          </Link>
        </div>
      </section>

      <footer className="border-t border-black/5 bg-base-white">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <LogoBlui tamanho={26} />
          <div className="flex gap-6 text-sm text-base-ink/45">
            <a href="mailto:contact@blui.online" className="hover:text-base-ink transition-colors">contact@blui.online</a>
            <a href="https://wa.me/27722958915" target="_blank" rel="noreferrer" className="hover:text-base-ink transition-colors">+27 72 295 8915</a>
            <a href="https://instagram.com/dalton_fds" target="_blank" rel="noreferrer" className="hover:text-base-ink transition-colors">Instagram</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
