import React from "react";

const Check = () => (
  <span className="check">✓</span>
);

export default function Vendas() {
  return (
    <div className="sales-page">

      {/* NAVBAR */}
      <header className="sales-nav">
        <div className="sales-container nav-inner">
          <a href="/" className="sales-logo">blui</a>

          <nav className="desktop-nav">
            <a href="#como-funciona">Como funciona</a>
            <a href="#recursos">Recursos</a>
            <a href="#problema">Porquê BLUI</a>
            <a href="#precos">Preços</a>
          </nav>

          <div className="nav-actions">
            <a href="/login" className="login-link">Entrar</a>
            <a href="/register" className="nav-button">Começar agora</a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <main>

        <section className="hero-section">
          <div className="sales-container hero-grid">

            <div className="hero-copy">
              <div className="eyebrow">
                <span className="eyebrow-dot"></span>
                Atendimento inteligente para negócios
              </div>

              <h1>
                Atendimento que
                <span> transforma conversa</span>
                em venda fechada.
              </h1>

              <p className="hero-description">
                Pare de vender no escuro. A BLUI atende os seus clientes,
                guarda o histórico de cada contacto e faz follow-up automático
                para recuperar oportunidades que seriam perdidas.
              </p>

              <div className="hero-actions">
                <a href="/register" className="primary-button">
                  Ativar a BLUI
                  <span>Continuar</span>
                </a>

                <a href="/login" className="secondary-button">
                  Já tenho conta
                </a>
              </div>

              <div className="hero-note">
                <Check />
                Sem contratos longos
                <Check />
                Comece em poucos minutos
              </div>
            </div>

            {/* HERO CARD */}
            <div className="hero-visual">
              <div className="dashboard-window">

                <div className="window-top">
                  <div className="window-dots">
                    <i></i><i></i><i></i>
                  </div>
                  <span>BLUI · Painel</span>
                  <div></div>
                </div>

                <div className="mini-dashboard">
                  <div className="mini-sidebar">
                    <strong>blui</strong>
                    <span className="active">Painel</span>
                    <span>Conversas</span>
                    <span>Contactos</span>
                    <span>Funil</span>
                    <span>Remarketing</span>
                  </div>

                  <div className="mini-content">
                    <div className="mini-heading">
                      <div>
                        <small>Visão geral</small>
                        <h3>Bom dia</h3>
                      </div>
                      <div className="avatar">D</div>
                    </div>

                    <div className="stats-grid">
                      <div className="stat-card">
                        <small>Receita</small>
                        <strong>$12,840</strong>
                        <em>+24,8%</em>
                      </div>

                      <div className="stat-card">
                        <small>Conversas</small>
                        <strong>428</strong>
                        <em>+18,2%</em>
                      </div>

                      <div className="stat-card">
                        <small>Vendas</small>
                        <strong>86</strong>
                        <em>+31,4%</em>
                      </div>
                    </div>

                    <div className="chart-card">
                      <div className="chart-title">
                        <span>Receita gerada</span>
                        <small>Últimos 7 dias</small>
                      </div>

                      <div className="chart">
                        <div className="chart-line"></div>
                        <div className="chart-bars">
                          <i></i>
                          <i></i>
                          <i></i>
                          <i></i>
                          <i></i>
                          <i></i>
                          <i></i>
                        </div>
                      </div>
                    </div>

                    <div className="conversation-card">
                      <div className="conversation-avatar">M</div>
                      <div>
                        <strong>Maria Silva</strong>
                        <span>Cliente voltou através do remarketing</span>
                      </div>
                      <b>+ $450</b>
                    </div>
                  </div>
                </div>

              </div>

              <div className="floating-card floating-one">
                <span>✓</span>
                Venda recuperada
                <strong>+ $450</strong>
              </div>

              <div className="floating-card floating-two">
                <span>24h</span>
                Follow-up automático
              </div>
            </div>

          </div>
        </section>

        {/* CHANNELS */}
        <section className="channels-section">
          <div className="sales-container">
            <p className="section-overline">UMA OPERAÇÃO, TODOS OS CANAIS</p>

            <div className="channel-grid">
              <div className="channel-card">
                <div className="channel-icon whatsapp">W</div>
                <div>
                  <strong>WhatsApp</strong>
                  <span>Atenda e venda</span>
                </div>
              </div>

              <div className="channel-card">
                <div className="channel-icon messenger">M</div>
                <div>
                  <strong>Messenger</strong>
                  <span>Centralize conversas</span>
                </div>
              </div>

              <div className="channel-card">
                <div className="channel-icon instagram">◎</div>
                <div>
                  <strong>Instagram</strong>
                  <span>Converta seguidores</span>
                </div>
              </div>

              <div className="channel-card">
                <div className="channel-icon blui-icon">B</div>
                <div>
                  <strong>BLUI</strong>
                  <span>Uma só operação</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="como-funciona" className="section light-section">
          <div className="sales-container">

            <div className="section-heading centered">
              <span>COMO FUNCIONA</span>
              <h2>
                A conversa começa.
                <br />
                <b>A BLUI não deixa terminar.</b>
              </h2>
              <p>
                A BLUI acompanha cada contacto desde a primeira mensagem
                até à compra — e continua depois dela.
              </p>
            </div>

            <div className="steps-grid">

              <div className="step-card">
                <div className="step-number">01</div>
                <div className="step-icon">01</div>
                <h3>O cliente conversa</h3>
                <p>
                  A BLUI recebe e organiza as conversas dos seus canais
                  num único lugar.
                </p>
              </div>

              <div className="step-card featured-step">
                <div className="step-number">02</div>
                <div className="step-icon">02</div>
                <h3>A BLUI lembra</h3>
                <p>
                  Cada contacto, produto, interesse e histórico ficam
                  associados ao cliente.
                </p>
              </div>

              <div className="step-card">
                <div className="step-number">03</div>
                <div className="step-icon">↻</div>
                <h3>A BLUI recupera</h3>
                <p>
                  Se o cliente desaparecer, o remarketing entra em ação
                  automaticamente.
                </p>
              </div>

            </div>

            <div className="timeline">
              <div>
                <strong>0h</strong>
                <span>Conversa</span>
              </div>
              <i></i>
              <div>
                <strong>24h</strong>
                <span>Primeiro follow-up</span>
              </div>
              <i></i>
              <div>
                <strong>7 dias</strong>
                <span>Novo ciclo</span>
              </div>
              <i></i>
              <div>
                <strong>24/7</strong>
                <span>Agente ativo</span>
              </div>
            </div>

          </div>
        </section>

        {/* REVENUE */}
        <section id="recursos" className="revenue-section">
          <div className="sales-container revenue-grid">

            <div className="revenue-copy">
              <span className="section-label">SEGMENTAÇÃO REAL</span>

              <h2>
                Receita,
                <br />
                <span>não conversas.</span>
              </h2>

              <p>
                Conversas são importantes. Mas o que realmente importa
                é saber quais contactos se transformaram em dinheiro.
              </p>

              <div className="feature-list">
                <div>
                  <Check />
                  <span>
                    <strong>Valor por contacto</strong>
                    Saiba quanto cada cliente gerou.
                  </span>
                </div>

                <div>
                  <Check />
                  <span>
                    <strong>Estados de venda</strong>
                    Identifique quem está novo, interessado,
                    pendente ou comprado.
                  </span>
                </div>

                <div>
                  <Check />
                  <span>
                    <strong>Dados reais</strong>
                    Tome decisões com base no que realmente converte.
                  </span>
                </div>
              </div>
            </div>

            <div className="revenue-card">
              <div className="revenue-card-top">
                <span>Receita recuperada</span>
                <b>Este mês</b>
              </div>

              <div className="revenue-value">$18,420</div>

              <div className="revenue-growth">
                <span>↑ 32,8%</span>
                <small>vs. mês anterior</small>
              </div>

              <div className="big-chart">
                <div className="big-chart-grid"></div>
                <div className="big-chart-line"></div>
              </div>

              <div className="revenue-bottom">
                <div>
                  <small>Contactos</small>
                  <strong>1.248</strong>
                </div>

                <div>
                  <small>Compraram</small>
                  <strong>184</strong>
                </div>

                <div>
                  <small>Conversão</small>
                  <strong>14,7%</strong>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* REMARKETING */}
        <section className="section light-section">
          <div className="sales-container remarketing-grid">

            <div className="remarketing-visual">
              <div className="remarketing-window">
                <div className="rm-header">
                  <div>
                    <span>Campanha automática</span>
                    <strong>Recuperação · Produto A</strong>
                  </div>
                  <span className="live">ATIVA</span>
                </div>

                <div className="rm-flow">
                  <div className="flow-item">
                    <span>01</span>
                    <div>
                      <strong>Cliente não comprou</strong>
                      <small>Contacto encerrado sem venda</small>
                    </div>
                  </div>

                  <div className="flow-arrow">↓</div>

                  <div className="flow-item blue">
                    <span>02</span>
                    <div>
                      <strong>Após 24 horas</strong>
                      <small>Follow-up automático enviado</small>
                    </div>
                  </div>

                  <div className="flow-arrow">↓</div>

                  <div className="flow-item green">
                    <span>03</span>
                    <div>
                      <strong>Após 7 dias</strong>
                      <small>Novo ciclo de remarketing</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="remarketing-copy">
              <span className="section-label">REMARKETING AUTOMÁTICO</span>

              <h2>
                24h → 7 dias.
                <br />
                <span>Sem esquecer ninguém.</span>
              </h2>

              <p>
                A maioria das vendas não acontece na primeira conversa.
                A BLUI cria ciclos de acompanhamento por produto para
                trazer o cliente de volta.
              </p>

              <a href="/register" className="text-button">
                Criar minha operação
                <span>Continuar</span>
              </a>
            </div>

          </div>
        </section>

        {/* PROBLEM */}
        <section id="problema" className="problem-section">
          <div className="sales-container">

            <div className="section-heading">
              <span>O PROBLEMA QUE NINGUÉM TE MOSTRA</span>
              <h2>
                Os leads chegam.
                <br />
                <b>Os clientes, não.</b>
              </h2>
              <p>
                Recebes mensagens todos os dias. Mas sem memória,
                follow-up e dados, grande parte fica apenas numa conversa
                que nunca chega a lado nenhum.
              </p>
            </div>

            <div className="problem-grid">

              <div className="problem-item">
                <div className="problem-icon">$</div>
                <h3>Perguntou o preço e desapareceu.</h3>
                <p>
                  O interesse estava lá. Mas ninguém voltou a conversar
                  com aquele cliente.
                </p>
              </div>

              <div className="problem-item">
                <div className="problem-icon">↻</div>
                <h3>Ninguém se lembrou de voltar.</h3>
                <p>
                  Sem automação, milhares de oportunidades dependem
                  da memória da equipa.
                </p>
              </div>

              <div className="problem-item">
                <div className="problem-icon">◌</div>
                <h3>Não sabes o que converte.</h3>
                <p>
                  Sem dados ligados à receita, fica difícil saber
                  quais clientes realmente compram.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* FEATURES */}
        <section className="features-section">
          <div className="sales-container">

            <div className="section-heading centered white-heading">
              <span>UMA PLATAFORMA COMPLETA</span>
              <h2>
                Tudo o que precisas
                <br />
                para vender melhor.
              </h2>
            </div>

            <div className="features-grid">

              <div className="feature-box">
                <span>01</span>
                <h3>Conversas</h3>
                <p>
                  Centraliza o atendimento e mantém o contexto
                  de cada cliente.
                </p>
              </div>

              <div className="feature-box">
                <span>02</span>
                <h3>Contactos</h3>
                <p>
                  Organiza leads, clientes, estados, origem e valor.
                </p>
              </div>

              <div className="feature-box">
                <span>03</span>
                <h3>Funil</h3>
                <p>
                  Cria etapas de venda para orientar o agente
                  e a tua operação.
                </p>
              </div>

              <div className="feature-box">
                <span>04</span>
                <h3>Remarketing</h3>
                <p>
                  Recupera automaticamente quem não comprou.
                </p>
              </div>

              <div className="feature-box">
                <span>05</span>
                <h3>Treino</h3>
                <p>
                  Dá ao agente conhecimento sobre produtos,
                  entrega, pagamento e scripts.
                </p>
              </div>

              <div className="feature-box">
                <span>06</span>
                <h3>Analytics</h3>
                <p>
                  Descobre onde estão as oportunidades e
                  quanto a operação está a gerar.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* PRICING */}
        <section id="precos" className="pricing-section">
          <div className="sales-container">

            <div className="section-heading centered">
              <span>COMEÇA SEM COMPLICAÇÃO</span>
              <h2>
                Uma operação inteligente
                <br />
                <b>sem contratos longos.</b>
              </h2>
              <p>
                Escolhe a estrutura que faz sentido para o teu negócio
                e começa a recuperar vendas.
              </p>
            </div>

            <div className="pricing-card">

              <div className="pricing-main">
                <span className="pricing-label">BLUI</span>

                <h3>Começa a vender com memória.</h3>

                <div className="price">
                  <small>a partir de</small>
                  <strong>$9</strong>
                </div>

                <p>
                  Começa pequeno e aumenta a operação à medida
                  que os teus clientes chegam.
                </p>

                <a href="/register" className="primary-button full">
                  Ativar a BLUI
                  <span>Continuar</span>
                </a>
              </div>

              <div className="pricing-features">
                <h4>Incluído na operação</h4>

                <div><Check /> Atendimento inteligente</div>
                <div><Check /> Gestão de contactos</div>
                <div><Check /> Funil de vendas</div>
                <div><Check /> Remarketing automático</div>
                <div><Check /> Treino por produto</div>
                <div><Check /> Analytics e receita</div>
                <div><Check /> Suporte</div>
              </div>

            </div>

          </div>
        </section>

        {/* CTA */}
        <section className="final-cta">
          <div className="sales-container">
            <div className="cta-box">
              <div className="cta-glow"></div>

              <span>PRONTO PARA PARAR DE VENDER NO ESCURO?</span>

              <h2>
                Começa a recuperar
                <br />
                vendas hoje.
              </h2>

              <p>
                Dá à tua operação memória, follow-up e inteligência
                para transformar mais conversas em clientes.
              </p>

              <div className="hero-actions centered-actions">
                <a href="/register" className="white-button">
                  Ativar a BLUI
                  <span>Continuar</span>
                </a>

                <a href="/login" className="outline-white-button">
                  Já tenho conta
                </a>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="sales-footer">
        <div className="sales-container footer-grid">

          <div>
            <div className="footer-logo">blui</div>
            <p>
              Atendimento inteligente que transforma
              conversa em venda fechada.
            </p>
          </div>

          <div>
            <h4>Produto</h4>
            <a href="#recursos">Recursos</a>
            <a href="#como-funciona">Como funciona</a>
            <a href="#precos">Preços</a>
          </div>

          <div>
            <h4>Conta</h4>
            <a href="/login">Entrar</a>
            <a href="/register">Começar agora</a>
          </div>

          <div>
            <h4>Contacto</h4>
            <a href="mailto:contact@blui.online">contact@blui.online</a>
            <span>+27 72 295 8915</span>
          </div>

        </div>

        <div className="sales-container footer-bottom">
          <span>© 2026 BLUI. Todos os direitos reservados.</span>
          <span>Atendimento · Remarketing · Vendas</span>
        </div>
      </footer>

    </div>
  );
}
