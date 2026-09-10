import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Wordmark from '../components/Wordmark.jsx';
import { IconChat, IconClock, IconChart, IconBolt, IconTarget, IconArrowRight, IconCheck } from '../components/Icons.jsx';

const recursos = [
  { Icon: IconChat, titulo: 'Transforma conversas em vendas', texto: 'O BLUI organiza contactos, conversas e oportunidades para que nenhum potencial cliente fique esquecido.' },
  { Icon: IconClock, titulo: 'Recupera quem desapareceu', texto: 'Automatiza follow-ups e remarketing para voltar a falar com quem demonstrou interesse mas não comprou.' },
  { Icon: IconTarget, titulo: 'Venda para o teu nicho', texto: 'Cria ofertas, segmentos e campanhas com base no comportamento real dos teus contactos.' },
  { Icon: IconChart, titulo: 'Vê onde estás a perder dinheiro', texto: 'Dados e métricas para descobrir o que está a converter, o que está parado e onde atacar a seguir.' },
  { Icon: IconBolt, titulo: 'Menos trabalho. Mais vendas.', texto: 'Automatiza tarefas repetitivas para a tua equipa passar menos tempo a perseguir leads e mais tempo a fechar.' },
  { Icon: IconCheck, titulo: 'Feito para vender internacionalmente', texto: 'Usa o BLUI a partir de qualquer país, moeda ou mercado. África é apenas um dos mercados onde podes operar.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-base-white text-base-ink">
      <header className="border-b border-black/5 sticky top-0 z-20 bg-base-white/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Wordmark animar />
          <div className="flex items-center gap-3">
            <Link to="/entrar" className="text-sm font-medium text-base-ink/70 hover:text-base-ink px-3 py-2">
              Entrar
            </Link>
            <Link to="/registar" className="text-sm font-semibold bg-brand-500 text-base-white px-5 py-2.5 rounded-xs hover:bg-brand-600 transition-colors">
              Começar agora
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-6 pt-20 pb-24 md:pt-28 md:pb-32 grid md:grid-cols-2 gap-14 items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 border border-brand-500/20 bg-brand-50 text-brand-600 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide">
                Vendas + Automação + Remarketing
              </div>

              <h1 className="mt-6 text-5xl md:text-6xl font-bold tracking-tight leading-[1.02]">
                Tens leads.
                <br />
                <span className="text-brand-600">Porque ainda estás a perder vendas?</span>
              </h1>

              <p className="mt-7 text-lg text-base-ink/65 max-w-xl leading-relaxed">
                O BLUI transforma contactos, conversas e leads esquecidos num sistema de vendas que trabalha todos os dias para recuperar oportunidades e aumentar as tuas conversões.
              </p>

              <div className="mt-9 flex flex-col sm:flex-row gap-4">
                <Link
                  to="/registar"
                  className="inline-flex items-center justify-center gap-2 bg-brand-500 text-base-white text-sm font-bold px-6 py-4 rounded-xs hover:bg-brand-600 transition-colors shadow-card"
                >
                  Quero vender mais
                  <IconArrowRight />
                </Link>
                <Link
                  to="/entrar"
                  className="inline-flex items-center justify-center text-sm font-semibold border border-black/10 px-6 py-4 rounded-xs hover:bg-base-fog transition-colors"
                >
                  Já tenho conta
                </Link>
              </div>

              <p className="mt-5 text-xs text-base-ink/45">
                Para negócios e empreendedores de qualquer país.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="relative"
            >
              <div className="rounded-xs border border-black/5 bg-base-white shadow-card p-6">
                <div className="flex items-center justify-between pb-5 border-b border-black/5">
                  <div>
                    <p className="text-xs text-base-ink/40 uppercase tracking-wide">Motor de vendas</p>
                    <p className="mt-1 font-semibold">Oportunidades recuperadas</p>
                  </div>
                  <span className="text-brand-600 font-bold">+32%</span>
                </div>

                <div className="mt-6 space-y-4">
                  {[
                    ['Lead interessado', 'Follow-up automático', 'Ativo'],
                    ['Carrinho parado', 'Oferta de recuperação', 'Ativo'],
                    ['Cliente antigo', 'Remarketing', 'Ativo'],
                    ['Lead sem resposta', 'Nova abordagem', 'Ativo'],
                  ].map(([nome, acao, estado]) => (
                    <div key={nome} className="flex items-center justify-between gap-4 border border-black/5 rounded-xs p-4">
                      <div>
                        <p className="text-sm font-semibold">{nome}</p>
                        <p className="mt-1 text-xs text-base-ink/50">{acao}</p>
                      </div>
                      <span className="text-xs font-semibold text-brand-600">{estado}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="absolute -bottom-5 -right-3 md:-right-6 bg-base-ink text-base-white rounded-xs px-5 py-4 shadow-card">
                <p className="text-2xl font-bold">24/7</p>
                <p className="text-xs text-base-white/60">a trabalhar nas oportunidades</p>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="bg-base-ink text-base-white">
          <div className="max-w-6xl mx-auto px-6 py-20 text-center">
            <p className="text-brand-400 text-sm font-bold uppercase tracking-widest">A verdade sobre vendas</p>
            <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight">
              A maioria dos negócios não precisa de mais leads.
              <br />
              <span className="text-brand-400">Precisa parar de desperdiçar os que já tem.</span>
            </h2>
            <p className="mt-6 max-w-2xl mx-auto text-base-white/60 leading-relaxed">
              Cada conversa ignorada, cada follow-up esquecido e cada cliente que nunca voltou representa dinheiro que poderia ter entrado no teu negócio.
            </p>
          </div>
        </section>

        <section className="border-b border-black/5 bg-base-fog">
          <div className="max-w-6xl mx-auto px-6 py-20">
            <div className="max-w-2xl">
              <p className="text-brand-600 text-sm font-bold uppercase tracking-wide">O teu novo sistema de vendas</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight">
                Não deixes dinheiro na mesa.
              </h2>
              <p className="mt-4 text-base-ink/60 leading-relaxed">
                O BLUI junta gestão de contactos, conversas, automações, remarketing, campanhas e análise num único lugar.
              </p>
            </div>

            <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recursos.map(({ Icon, titulo, texto }) => (
                <div key={titulo} className="bg-base-white border border-black/5 rounded-xs p-6 hover:shadow-card transition-shadow">
                  <div className="w-10 h-10 rounded-xs bg-brand-50 text-brand-600 flex items-center justify-center">
                    <Icon />
                  </div>
                  <h3 className="mt-5 font-bold">{titulo}</h3>
                  <p className="mt-2 text-sm text-base-ink/60 leading-relaxed">{texto}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-24">
          <div className="grid md:grid-cols-2 gap-14 items-center">
            <div>
              <p className="text-brand-600 text-sm font-bold uppercase tracking-wide">Black / High-ticket / Performance</p>
              <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight">
                Se o teu negócio depende de leads, o BLUI foi feito para ti.
              </h2>
              <p className="mt-5 text-base-ink/60 leading-relaxed">
                Infoprodutores, agências, e-commerce, serviços, vendas high-ticket, afiliados, criadores e negócios locais podem usar o BLUI para organizar e atacar o funil comercial.
              </p>
            </div>

            <ul className="space-y-5">
              {[
                'Nunca mais depender da memória da equipa para fazer follow-up',
                'Recuperar leads que estavam praticamente perdidos',
                'Separar compradores, interessados e oportunidades quentes',
                'Criar campanhas de remarketing com dados próprios',
                'Operar em qualquer país e vender para qualquer mercado',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm font-medium">
                  <span className="mt-0.5 text-brand-600"><IconCheck /></span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="bg-brand-500 text-base-white">
          <div className="max-w-4xl mx-auto px-6 py-24 text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-base-white/70">A decisão é simples</p>
            <h2 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight">
              Continua a perder leads.
              <br />
              Ou começa a recuperar vendas.
            </h2>
            <p className="mt-6 text-base-white/75 max-w-xl mx-auto">
              Cria a tua conta no BLUI e transforma o teu processo comercial num sistema que não depende de sorte, memória ou improviso.
            </p>
            <Link
              to="/registar"
              className="mt-9 inline-flex items-center gap-2 bg-base-white text-base-ink text-sm font-bold px-7 py-4 rounded-xs hover:bg-base-fog transition-colors"
            >
              Começar agora
              <IconArrowRight />
            </Link>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-20">
          <div className="border border-black/5 rounded-xs p-8 md:p-12 bg-base-fog flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div>
              <p className="text-brand-600 text-sm font-bold uppercase tracking-wide">BLUI Global</p>
              <h2 className="mt-3 text-2xl md:text-3xl font-bold">Um sistema. Qualquer país. Qualquer mercado.</h2>
              <p className="mt-3 text-sm text-base-ink/60 max-w-2xl">
                O BLUI não é uma plataforma limitada a África. Podes operar internacionalmente e construir vendas em diferentes países, mercados e moedas.
              </p>
            </div>
            <Link to="/registar" className="shrink-0 inline-flex items-center justify-center gap-2 bg-base-ink text-base-white text-sm font-bold px-6 py-4 rounded-xs hover:bg-brand-900 transition-colors">
              Criar conta
              <IconArrowRight />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-black/5">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <Wordmark tamanho="text-sm" />
            <div className="text-sm text-base-ink/55">
              <p>+27722958915</p>
              <p className="mt-1">contact@blui.online</p>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-black/5 flex flex-col sm:flex-row justify-between gap-3 text-xs text-base-ink/40">
            <p>© {new Date().getFullYear()} BLUI. Todos os direitos reservados.</p>
            <p>Global • Qualquer país • Qualquer mercado</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
