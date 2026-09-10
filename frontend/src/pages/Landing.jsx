import React from 'react';
import { Link } from 'react-router-dom';

function LogoBlui({ tamanho = 40, escuro = false }) {
  return (
    <div className="flex items-center gap-2">
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

const iconProps = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };
const IconInbox = () => (<svg {...iconProps}><path d="M3 12h4l2 3h6l2-3h4" /><path d="M5 12 3 5h18l-2 7" /><path d="M3 12v6a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-6" /></svg>);
const IconMemoria = () => (<svg {...iconProps}><circle cx="12" cy="12" r="3.2" /><path d="M12 4v2.5M12 17.5V20M4 12h2.5M17.5 12H20M6.3 6.3l1.8 1.8M15.9 15.9l1.8 1.8M6.3 17.7l1.8-1.8M15.9 8.1l1.8-1.8" /></svg>);
const IconCiclo = () => (<svg {...iconProps}><path d="M4 12a8 8 0 0 1 13.5-5.8M20 12a8 8 0 0 1-13.5 5.8" /><path d="M17.5 3v3.5H14M6.5 21v-3.5H10" /></svg>);
const IconMegafone = () => (<svg {...iconProps}><path d="M3 10v4a1 1 0 0 0 1 1h2l7 4V5L6 9H4a1 1 0 0 0-1 1Z" /><path d="M17 9a4 4 0 0 1 0 6M20 6a8 8 0 0 1 0 12" /></svg>);
const IconGrafico = () => (<svg {...iconProps}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></svg>);
const IconFecho = () => (<svg {...iconProps}><path d="M9 12.5 11 15l4.5-5.5" /><circle cx="12" cy="12" r="9.5" /></svg>);

const FUNCIONALIDADES = [
  { Icon: IconInbox, titulo: 'Um canal, três frentes', desc: 'WhatsApp, Messenger e Instagram geridos como uma única operação de vendas.' },
  { Icon: IconMemoria, titulo: 'Memória por contacto', desc: 'Cada conversa continua exatamente de onde parou — sem repetir, sem perder contexto.' },
  { Icon: IconCiclo, titulo: 'Remarketing por produto', desc: 'Ciclos automáticos de recuperação: 24 horas, depois 7 dias, sem intervenção manual.' },
  { Icon: IconMegafone, titulo: 'Campanhas no Facebook Ads', desc: 'Segmentação construída a partir dos teus próprios dados de conversão.' },
  { Icon: IconGrafico, titulo: 'Métricas que mandam', desc: 'Funil, conversão e receita por canal e produto — a decisão deixa de ser instinto.' },
  { Icon: IconFecho, titulo: 'Do primeiro contacto ao pago', desc: 'A BLUI acompanha a venda até ao fim e regista tudo, automaticamente.' },
];

function GraficoHero() {
  const pontos = [8, 14, 12, 22, 19, 30, 27, 38, 44];
  const max = Math.max(...pontos);
  const largura = 520, altura = 180;
  const passo = largura / (pontos.length - 1);
  const coordenadas = pontos.map((v, i) => [i * passo, altura - (v / max) * (altura - 20) - 10]);
  const linha = coordenadas.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ');
  const area = `${linha} L${largura},${altura} L0,${altura} Z`;

  return (
    <svg viewBox={`0 0 ${largura} ${altura}`} className="w-full h-auto overflow-visible">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#22B8FF" stopOpacity="0.35" />
          <stop offset="1" stopColor="#22B8FF" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#22B8FF" />
          <stop offset="1" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1="0" x2={largura} y1={altura * f} y2={altura * f} stroke="white" strokeOpacity="0.06" />
      ))}
      <path d={area} fill="url(#areaGrad)" className="blui-fade-up" style={{ animationDelay: '0.6s' }} />
      <path d={linha} fill="none" stroke="url(#lineGrad)" strokeWidth="2.5" strokeLinecap="round" pathLength="1000" className="blui-draw-line" />
      {coordenadas.map(([x, y], i) => (
        <circle
          key={i} cx={x} cy={y} r={i === coordenadas.length - 1 ? 5 : 2.5}
          fill={i === coordenadas.length - 1 ? '#22B8FF' : 'white'}
          fillOpacity={i === coordenadas.length - 1 ? 1 : 0.6}
          className={i === coordenadas.length - 1 ? 'blui-pulse-dot' : ''}
        />
      ))}
    </svg>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-base-white overflow-hidden">
      <style>{`
        @keyframes bluiFadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes bluiFloat { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-16px) scale(1.04); } }
        @keyframes bluiDraw { from { stroke-dashoffset: 1000; } to { stroke-dashoffset: 0; } }
        @keyframes bluiPulse { 0%, 100% { opacity: 1; r: 5; } 50% { opacity: 0.5; r: 8; } }
        @keyframes bluiShadowPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(124,58,237,0.45), 0 0 24px 4px rgba(34,184,255,0.25); }
          50% { box-shadow: 0 0 0 10px rgba(124,58,237,0), 0 0 34px 10px rgba(34,184,255,0.4); }
        }
        .blui-fade-up { opacity: 0; animation: bluiFadeUp 0.7s ease-out forwards; }
        .blui-orb { animation: bluiFloat 7s ease-in-out infinite; }
        .blui-draw-line { stroke-dasharray: 1000; animation: bluiDraw 1.8s ease-out forwards 0.3s; stroke-dashoffset: 1000; }
        .blui-pulse-dot { animation: bluiPulse 1.8s ease-in-out infinite; transform-origin: center; }
        .blui-cta-glow { animation: bluiShadowPulse 2.4s ease-in-out infinite; }
      `}</style>

      <header className="max-w-6xl mx-auto flex items-center justify-between px-6 py-6 relative z-10">
        <LogoBlui />
        <div className="flex items-center gap-3">
          <Link to="/entrar" className="text-sm font-medium text-base-ink/70 hover:text-base-ink transition-colors">Entrar</Link>
          <Link to="/registar" className="bg-brand-500 text-base-white text-sm font-medium px-5 py-2.5 rounded-xs hover:bg-brand-600 transition-colors">
            Começar agora
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="relative bg-base-ink overflow-hidden">
        <div className="blui-orb absolute -top-24 -left-24 w-96 h-96 rounded-full bg-brand-500/25 blur-3xl pointer-events-none" />
        <div className="blui-orb absolute -bottom-32 right-0 w-[28rem] h-[28rem] rounded-full bg-purple-600/20 blur-3xl pointer-events-none" style={{ animationDelay: '2s' }} />

        <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-16 grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <span className="blui-fade-up inline-block text-xs font-semibold tracking-widest text-brand-400 uppercase mb-5">
              Vendas · Automação · Inteligência de dados
            </span>
            <h1 className="blui-fade-up text-4xl sm:text-5xl font-bold text-base-white tracking-tight leading-[1.1]" style={{ animationDelay: '0.1s' }}>
              A tua concorrência não está a vencer-te. Está só a recuperar clientes que tu deixaste ir.
            </h1>
            <p className="blui-fade-up mt-6 text-lg text-base-white/55 max-w-lg" style={{ animationDelay: '0.2s' }}>
              A BLUI transforma cada conversa no WhatsApp, Messenger e Instagram numa máquina de recuperação
              de vendas — a trabalhar sozinha, 24 horas por dia, todos os dias.
            </p>
            <div className="blui-fade-up mt-9 flex flex-wrap items-center gap-4" style={{ animationDelay: '0.3s' }}>
              <Link to="/registar" className="blui-cta-glow bg-brand-500 text-base-white font-semibold px-7 py-3 rounded-xs hover:bg-brand-600 transition-colors">
                Ativar o sistema agora
              </Link>
              <Link to="/entrar" className="text-sm font-medium text-base-white/60 hover:text-base-white transition-colors">
                Já tenho conta
              </Link>
            </div>
          </div>

          <div className="blui-fade-up bg-white/5 border border-white/10 rounded-xs p-6 backdrop-blur" style={{ animationDelay: '0.35s' }}>
            <p className="text-xs font-medium text-base-white/40 mb-4">RECUPERAÇÃO DE OPORTUNIDADES · TENDÊNCIA</p>
            <GraficoHero />
            <div className="mt-4 flex justify-between text-xs text-base-white/40">
              <span>Início do ciclo</span>
              <span>Follow-up 24h</span>
              <span>Follow-up 7 dias</span>
            </div>
          </div>
        </div>
      </section>

      {/* AFIRMAÇÃO */}
      <section className="border-b border-black/5">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <p className="text-xs font-semibold tracking-widest text-brand-600 uppercase mb-3">A verdade sobre vendas</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-base-ink leading-snug">
            Não precisas de mais leads. Precisas de deixar de perder os que já tens.
          </h2>
        </div>
      </section>

      {/* FUNCIONALIDADES */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <p className="text-xs font-semibold tracking-widest text-brand-600 uppercase mb-2">O sistema</p>
        <h2 className="text-3xl font-bold text-base-ink mb-10">Tudo o que uma operação de vendas séria precisa.</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FUNCIONALIDADES.map(({ Icon, titulo, desc }, i) => (
            <div
              key={titulo}
              className="blui-fade-up group border border-black/5 rounded-xs p-6 hover:border-brand-500/50 hover:shadow-lg transition-all duration-300"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="w-10 h-10 rounded-xs bg-brand-50 text-brand-600 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
                <Icon />
              </div>
              <h3 className="font-semibold text-base-ink mb-1.5">{titulo}</h3>
              <p className="text-sm text-base-ink/60">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="relative bg-base-ink py-20 overflow-hidden">
        <div className="blui-orb absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[36rem] h-[36rem] rounded-full bg-brand-500/15 blur-3xl pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-base-white leading-snug">
            Continua a perder clientes em silêncio.<br />Ou instala o sistema que os recupera por ti.
          </h2>
          <Link to="/registar" className="blui-cta-glow mt-8 inline-block bg-brand-500 text-base-white font-semibold px-7 py-3 rounded-xs hover:bg-brand-600 transition-colors">
            Ativar o sistema agora
          </Link>
        </div>
      </section>

      <footer className="border-t border-black/5">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <LogoBlui tamanho={28} />
          <div className="flex gap-5 text-sm text-base-ink/50">
            <a href="mailto:contact@blui.online" className="hover:text-base-ink transition-colors">contact@blui.online</a>
            <a href="https://wa.me/27722958915" target="_blank" rel="noreferrer" className="hover:text-base-ink transition-colors">+27 72 295 8915</a>
            <a href="https://instagram.com/dalton_fds" target="_blank" rel="noreferrer" className="hover:text-base-ink transition-colors">Instagram</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
