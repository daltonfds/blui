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

const OPORTUNIDADES = [
  { titulo: 'Lead quente sem resposta há 3h', acao: 'Alerta enviado', estado: 'Ativo' },
  { titulo: 'Carrinho parado há 40 min', acao: 'Oferta de recuperação', estado: 'Ativo' },
  { titulo: 'Cliente antigo, 32 dias sem comprar', acao: 'Remarketing agendado', estado: 'Ativo' },
  { titulo: 'Pergunta que o agente não sabe responder', acao: 'Encaminhado a humano', estado: 'Resolvido' },
];

const FUNCIONALIDADES = [
  { icon: '💬', titulo: 'Um único inbox para tudo', desc: 'WhatsApp, Messenger e Instagram na mesma conversa — nenhum lead se perde entre apps.' },
  { icon: '🧠', titulo: 'Agente que nunca esquece', desc: 'Memória por contacto. O teu cliente nunca tem de repetir o que já disse.' },
  { icon: '🔁', titulo: 'Recupera quem foge', desc: 'Follow-up automático às 24h, e um novo ciclo aos 7 dias — sem ninguém ter de lembrar.' },
  { icon: '📣', titulo: 'Anúncios com os teus dados', desc: 'Cria campanhas no Facebook Ads a partir do que já sabes sobre quem compra de ti.' },
  { icon: '📊', titulo: 'Vê onde estás a perder dinheiro', desc: 'Funil, conversão e receita por produto, canal e campanha — em tempo real, não no fim do mês.' },
  { icon: '✅', titulo: 'Do "olá" ao "pago"', desc: 'A conversa não termina na venda — a BLUI confirma, regista e segue para o próximo cliente.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-base-white">
      <header className="max-w-6xl mx-auto flex items-center justify-between px-6 py-6">
        <LogoBlui />
        <div className="flex items-center gap-3">
          <Link to="/entrar" className="text-sm font-medium text-base-ink/70 hover:text-base-ink transition-colors">Entrar</Link>
          <Link to="/registar" className="bg-brand-500 text-base-white text-sm font-medium px-5 py-2.5 rounded-xs hover:bg-brand-600 transition-colors">
            Começar agora
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-6 pt-10 pb-20 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-block text-xs font-semibold tracking-wide text-brand-600 bg-brand-50 px-3 py-1 rounded-xs mb-5">
            VENDAS + AUTOMAÇÃO + REMARKETING
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-base-ink tracking-tight leading-tight">
            Tens leads.<br />
            <span className="text-brand-600">Estás só a deixá-los ir embora.</span>
          </h1>
          <p className="mt-6 text-lg text-base-ink/60 max-w-lg">
            A BLUI atende no WhatsApp, Messenger e Instagram, lembra-se de cada conversa, corre atrás de quem
            desaparece e fecha a venda — enquanto tu fazes o resto do negócio.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link to="/registar" className="bg-brand-500 text-base-white font-medium px-7 py-3 rounded-xs hover:bg-brand-600 transition-colors">
              Quero parar de perder vendas →
            </Link>
            <Link to="/entrar" className="text-sm font-medium text-base-ink/70 hover:text-base-ink transition-colors">
              Já tenho conta
            </Link>
          </div>
          <p className="mt-4 text-xs text-base-ink/40">Para negócios e empreendedores de qualquer país. Começa por R$5.</p>
        </div>

        <div className="bg-base-white border border-black/5 rounded-xs shadow-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <p className="text-xs font-medium text-base-ink/50">MOTOR DE VENDAS · Oportunidades recuperadas</p>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-xs">exemplo ilustrativo</span>
          </div>
          <div className="divide-y divide-black/5">
            {OPORTUNIDADES.map((o) => (
              <div key={o.titulo} className="py-3 flex justify-between items-center">
                <div>
                  <p className="text-sm text-base-ink">{o.titulo}</p>
                  <p className="text-xs text-base-ink/40">{o.acao}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-xs ${o.estado === 'Ativo' ? 'bg-brand-50 text-brand-600' : 'bg-base-fog text-base-ink/50'}`}>
                  {o.estado}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-base-ink text-base-white text-xs font-medium px-4 py-2.5 rounded-xs inline-block">
            🕐 24/7 a trabalhar nas tuas oportunidades
          </div>
        </div>
      </section>

      {/* VERDADE INCÓMODA */}
      <section className="bg-base-ink py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs font-semibold tracking-wide text-brand-400 mb-3">A VERDADE SOBRE VENDAS</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-base-white leading-snug">
            A maioria dos negócios não precisa de mais leads.<br />Precisa de parar de desperdiçar os que já tem.
          </h2>
          <p className="mt-4 text-base-white/50 max-w-2xl mx-auto">
            Cada conversa ignorada, cada follow-up esquecido e cada cliente que nunca mais voltou é dinheiro que
            já esteve nas tuas mãos.
          </p>
        </div>
      </section>

      {/* FUNCIONALIDADES */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <p className="text-xs font-semibold tracking-wide text-brand-600 mb-2">O TEU NOVO SISTEMA DE VENDAS</p>
        <h2 className="text-3xl font-bold text-base-ink mb-3">Não deixes dinheiro na mesa.</h2>
        <p className="text-base-ink/60 max-w-2xl mb-10">
          A BLUI junta contactos, conversas, automações, remarketing, campanhas e análise num único lugar.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FUNCIONALIDADES.map((f) => (
            <div key={f.titulo} className="bg-base-fog rounded-xs p-6">
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-base-ink mb-1.5">{f.titulo}</h3>
              <p className="text-sm text-base-ink/60">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PARA QUEM É */}
      <section className="max-w-6xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-10 items-start">
        <div>
          <p className="text-xs font-semibold tracking-wide text-brand-600 mb-2">HIGH-TICKET · PERFORMANCE · VENDAS DIRETAS</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-base-ink leading-snug mb-4">
            Se o teu negócio depende de conversas para vender, a BLUI foi feita para ti.
          </h2>
          <p className="text-base-ink/60">
            Infoprodutores, agências, e-commerce, serviços, afiliados, criadores e negócios locais usam a BLUI
            para nunca mais perder um cliente por falta de follow-up.
          </p>
        </div>
        <ul className="space-y-4">
          {[
            'Nunca mais depender da memória de alguém para fazer follow-up',
            'Recuperar leads que já estavam praticamente perdidos',
            'Separar quem compra, quem está interessado e quem só está a curiosear',
            'Criar campanhas de remarketing com os teus próprios dados',
            'Vender em qualquer país, qualquer moeda, qualquer mercado',
          ].map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="text-brand-500 font-bold mt-0.5">✓</span>
              <span className="text-sm text-base-ink/80">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* CTA FORTE */}
      <section className="bg-brand-500 py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-xs font-semibold tracking-wide text-brand-100 mb-3">A DECISÃO É SIMPLES</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-base-white leading-snug">
            Continua a perder clientes.<br />Ou começa a fechar vendas com a BLUI.
          </h2>
          <p className="mt-4 text-brand-50/80">
            Cria a tua conta e transforma o teu processo comercial num sistema que não depende de sorte,
            memória ou improviso.
          </p>
          <Link
            to="/registar"
            className="mt-8 inline-block bg-base-white text-brand-600 font-semibold px-7 py-3 rounded-xs hover:bg-base-fog transition-colors"
          >
            Começar agora →
          </Link>
        </div>
      </section>

      {/* GLOBAL */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="bg-base-fog rounded-xs p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-xs font-semibold tracking-wide text-brand-600 mb-2">BLUI GLOBAL</p>
            <h3 className="text-xl font-bold text-base-ink mb-2">Um sistema. Qualquer país. Qualquer mercado.</h3>
            <p className="text-sm text-base-ink/60 max-w-md">
              A BLUI não é uma plataforma limitada a um país. Opera internacionalmente e vende em qualquer
              moeda, qualquer idioma, qualquer fuso horário.
            </p>
          </div>
          <Link to="/registar" className="bg-base-ink text-base-white text-sm font-medium px-6 py-3 rounded-xs hover:bg-black transition-colors shrink-0">
            Criar conta →
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
