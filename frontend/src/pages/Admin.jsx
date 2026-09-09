import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LayoutApp from '../components/LayoutApp.jsx';
import { api } from '../lib/api.js';
import { supabase } from '../lib/supabaseClient.js';

export default function Admin() {
  const navigate = useNavigate();

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [resumo, setResumo] = useState(null);
  const [pendentes, setPendentes] = useState([]);
  const [utilizadores, setUtilizadores] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [aba, setAba] = useState('resumo');

  async function verificarAdmin() {
    const { data, error } = await supabase.rpc('is_admin');

    if (error || !data) {
      navigate('/painel', { replace: true });
      return false;
    }

    return true;
  }

  async function carregar() {
    try {
      setErro('');

      const autorizado = await verificarAdmin();

      if (!autorizado) return;

      const resultados = await Promise.all([
        api.get('/api/admin/resumo'),
        api.get('/api/admin/assinaturas-pendentes'),
        api.get('/api/admin/utilizadores'),
        api.get('/api/admin/tickets'),
      ]);

      setResumo(resultados[0]);
      setPendentes(Array.isArray(resultados[1]) ? resultados[1] : []);
      setUtilizadores(Array.isArray(resultados[2]) ? resultados[2] : []);
      setTickets(Array.isArray(resultados[3]) ? resultados[3] : []);
    } catch (e) {
      console.error(e);
      setErro(e?.message || 'Não foi possível carregar o painel administrativo.');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function aprovar(id) {
    try {
      await api.post(`/api/admin/assinaturas/${id}/aprovar`, {});
      await carregar();
    } catch (e) {
      setErro(e?.message || 'Não foi possível aprovar a assinatura.');
    }
  }

  async function rejeitar(id) {
    try {
      await api.post(`/api/admin/assinaturas/${id}/rejeitar`, {});
      await carregar();
    } catch (e) {
      setErro(e?.message || 'Não foi possível rejeitar a assinatura.');
    }
  }

  if (carregando) {
    return (
      <LayoutApp>
        <div className="p-8 text-sm text-base-ink/50">
          A carregar administração...
        </div>
      </LayoutApp>
    );
  }

  return (
    <LayoutApp>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-7">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 text-[11px] font-bold mb-3">
            ADMINISTRADOR
          </div>

          <h1 className="text-3xl font-semibold text-base-ink">
            Administração BLUI
          </h1>

          <p className="text-sm text-base-ink/55 mt-1">
            Controle de utilizadores, assinaturas, receita e suporte.
          </p>
        </div>

        <button
          onClick={carregar}
          className="self-start md:self-auto px-4 py-2 rounded-xs border border-black/10 text-sm hover:bg-base-fog"
        >
          Atualizar
        </button>
      </div>

      {erro && (
        <div className="mb-5 p-4 rounded-xs border border-signal-red/20 bg-signal-red/5 text-sm text-signal-red">
          {erro}
        </div>
      )}

      {resumo && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Cartao
            titulo="Utilizadores"
            valor={resumo.totalUtilizadores || 0}
          />

          <Cartao
            titulo="Assinaturas ativas"
            valor={resumo.assinaturasAtivas || 0}
          />

          <Cartao
            titulo="Receita mensal"
            valor={`R$ ${Number(resumo.receitaMensalBrl || 0).toFixed(0)}`}
          />

          <Cartao
            titulo="Pedidos pendentes"
            valor={pendentes.length}
          />
        </div>
      )}

      <div className="flex gap-5 mb-5 text-sm border-b border-black/5 overflow-x-auto">
        <Tab
          ativo={aba === 'resumo'}
          onClick={() => setAba('resumo')}
        >
          Assinaturas
        </Tab>

        <Tab
          ativo={aba === 'utilizadores'}
          onClick={() => setAba('utilizadores')}
        >
          Utilizadores
        </Tab>

        <Tab
          ativo={aba === 'tickets'}
          onClick={() => setAba('tickets')}
        >
          Suporte
        </Tab>
      </div>

      {aba === 'resumo' && (
        <section className="bg-base-white border border-black/5 rounded-xs overflow-hidden">
          <div className="p-5 border-b border-black/5">
            <h2 className="font-semibold text-base-ink">
              Assinaturas pendentes
            </h2>

            <p className="text-xs text-base-ink/45 mt-1">
              Pedidos que precisam de aprovação administrativa.
            </p>
          </div>

          {pendentes.length === 0 ? (
            <p className="p-6 text-sm text-base-ink/40">
              Não existem pedidos pendentes.
            </p>
          ) : (
            <div className="divide-y divide-black/5">
              {pendentes.map((p) => (
                <div
                  key={p.id}
                  className="p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
                >
                  <div>
                    <p className="text-sm font-medium text-base-ink">
                      {p.profiles?.nome || 'Sem nome'}
                    </p>

                    <p className="text-xs text-base-ink/45 mt-1">
                      {p.profiles?.telefone || 'Sem telefone'}
                    </p>

                    <p className="text-sm mt-2">
                      {p.planos?.nome || 'Plano'}{' '}
                      <span className="text-base-ink/45">
                        — R$ {Number(p.planos?.preco_brl || 0).toFixed(0)}
                      </span>
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => aprovar(p.id)}
                      className="px-4 py-2 rounded-xs bg-brand-500 text-base-white text-sm font-medium"
                    >
                      Aprovar
                    </button>

                    <button
                      onClick={() => rejeitar(p.id)}
                      className="px-4 py-2 rounded-xs border border-signal-red/25 text-signal-red text-sm"
                    >
                      Rejeitar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {aba === 'utilizadores' && (
        <section className="bg-base-white border border-black/5 rounded-xs overflow-hidden">
          <div className="p-5 border-b border-black/5">
            <h2 className="font-semibold text-base-ink">
              Utilizadores da BLUI
            </h2>

            <p className="text-xs text-base-ink/45 mt-1">
              Estado das contas e utilização.
            </p>
          </div>

          {utilizadores.length === 0 ? (
            <p className="p-6 text-sm text-base-ink/40">
              Nenhum utilizador encontrado.
            </p>
          ) : (
            <div className="divide-y divide-black/5">
              {utilizadores.map((u) => {
                const assinatura = u.assinaturas?.[0];
                const plano = assinatura?.planos;

                return (
                  <div
                    key={u.id}
                    className="p-5 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-base-ink">
                          {u.nome || 'Sem nome'}
                        </p>

                        {u.is_admin && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-50 text-brand-700">
                            ADMIN
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-base-ink/45 mt-1">
                        {u.telefone || 'Sem telefone'}
                        {' · '}
                        {u.localizacao || 'Sem localização'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                      <Mini
                        titulo="Plano"
                        valor={plano?.nome || 'Sem plano'}
                      />

                      <Mini
                        titulo="Estado"
                        valor={assinatura?.estado || '—'}
                      />

                      <Mini
                        titulo="Mensagens"
                        valor={assinatura?.mensagens_usadas ?? 0}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {aba === 'tickets' && (
        <section className="bg-base-white border border-black/5 rounded-xs overflow-hidden">
          <div className="p-5 border-b border-black/5">
            <h2 className="font-semibold text-base-ink">
              Suporte
            </h2>

            <p className="text-xs text-base-ink/45 mt-1">
              Pedidos de ajuda e solicitações de atendimento humano.
            </p>
          </div>

          {tickets.length === 0 ? (
            <p className="p-6 text-sm text-base-ink/40">
              Nenhum ticket encontrado.
            </p>
          ) : (
            <div className="divide-y divide-black/5">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="p-5">
                  <div className="flex flex-col md:flex-row md:justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-base-ink">
                        {ticket.profiles?.nome || 'Utilizador'}
                      </p>

                      <p className="text-xs text-base-ink/45 mt-1">
                        {ticket.profiles?.telefone || 'Sem telefone'}
                      </p>
                    </div>

                    {ticket.humano_solicitado && (
                      <span className="self-start px-2 py-1 rounded-full text-[10px] font-bold bg-signal-red/10 text-signal-red">
                        HUMANO SOLICITADO
                      </span>
                    )}
                  </div>

                  <div className="mt-3 text-sm text-base-ink/70 whitespace-pre-wrap">
                    {ticket.mensagem ||
                      ticket.descricao ||
                      ticket.assunto ||
                      'Ticket sem descrição.'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </LayoutApp>
  );
}

function Cartao({ titulo, valor }) {
  return (
    <div className="bg-base-white border border-black/5 rounded-xs p-5">
      <p className="text-xs text-base-ink/50">{titulo}</p>
      <p className="text-2xl font-bold text-base-ink mt-1">
        {valor}
      </p>
    </div>
  );
}

function Mini({ titulo, valor }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-base-ink/35">
        {titulo}
      </p>
      <p className="text-xs font-medium text-base-ink mt-1">
        {valor}
      </p>
    </div>
  );
}

function Tab({ ativo, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`pb-3 whitespace-nowrap ${
        ativo
          ? 'border-b-2 border-brand-500 text-brand-700 font-medium'
          : 'text-base-ink/50'
      }`}
    >
      {children}
    </button>
  );
}
