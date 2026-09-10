import { useMemo, useState } from 'react';

const etapasIniciais = [
  {
    id: 'novo-lead',
    nome: 'Novo Lead',
    descricao: 'Primeiro contacto recebido.',
    objetivo: 'Identificar e iniciar a conversa.',
    perguntas: ['Como posso ajudar?', 'O que procuras neste momento?'],
    conhecimento: 'O chatbot deve receber o lead, entender a necessidade e iniciar a qualificação.',
    condicao: 'Quando o lead responder e demonstrar interesse.',
    acao: 'Avançar para Qualificação',
  },
  {
    id: 'qualificacao',
    nome: 'Qualificação',
    descricao: 'Entender necessidade, orçamento e intenção.',
    objetivo: 'Determinar se o lead é uma oportunidade real.',
    perguntas: ['Qual é a tua necessidade?', 'Qual é o teu orçamento?', 'Quando pretendes começar?'],
    conhecimento: 'Recolher necessidade, orçamento, prazo e contexto antes de apresentar uma oferta.',
    condicao: 'Quando necessidade e intenção de compra estiverem claras.',
    acao: 'Avançar para Interesse',
  },
  {
    id: 'interesse',
    nome: 'Interesse',
    descricao: 'Lead demonstrou interesse na solução.',
    objetivo: 'Apresentar a solução adequada.',
    perguntas: ['Queres conhecer como funciona?', 'Gostarias de receber a proposta?'],
    conhecimento: 'Explicar o produto ou serviço de forma objetiva e responder às principais dúvidas.',
    condicao: 'Quando o lead pedir preço, proposta ou quiser avançar.',
    acao: 'Avançar para Oferta',
  },
  {
    id: 'oferta',
    nome: 'Oferta',
    descricao: 'Apresentação da proposta comercial.',
    objetivo: 'Transformar interesse em decisão.',
    perguntas: ['A proposta faz sentido para ti?', 'Queres avançar com a compra?'],
    conhecimento: 'Apresentar preço, benefícios, condições de pagamento, entrega e garantia quando aplicável.',
    condicao: 'Quando o cliente aceitar a proposta.',
    acao: 'Avançar para Cliente',
  },
  {
    id: 'cliente',
    nome: 'Cliente',
    descricao: 'Cliente convertido.',
    objetivo: 'Concluir a venda e iniciar pós-venda.',
    perguntas: [],
    conhecimento: 'Confirmar pagamento, entrega e próximos passos. Nunca pedir novamente dados já recolhidos.',
    condicao: 'Pagamento confirmado.',
    acao: 'Iniciar Pós-venda',
  },
];

function novoId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function Funil() {
  const [etapas, setEtapas] = useState(() => {
    try {
      const guardado = localStorage.getItem('blui_funil');
      return guardado ? JSON.parse(guardado) : etapasIniciais;
    } catch {
      return etapasIniciais;
    }
  });

  const [selecionada, setSelecionada] = useState(etapas[0]?.id || null);
  const [nomeFunil, setNomeFunil] = useState(() => localStorage.getItem('blui_funil_nome') || 'Funil de Vendas');
  const [editandoNome, setEditandoNome] = useState(false);
  const [modo, setModo] = useState('funil');

  const etapaAtual = etapas.find((e) => e.id === selecionada);

  const totalEtapas = etapas.length;

  const salvar = (novasEtapas = etapas, novoNome = nomeFunil) => {
    setEtapas(novasEtapas);
    localStorage.setItem('blui_funil', JSON.stringify(novasEtapas));
    localStorage.setItem('blui_funil_nome', novoNome);
  };

  const atualizarEtapa = (campo, valor) => {
    const novas = etapas.map((e) =>
      e.id === selecionada ? { ...e, [campo]: valor } : e
    );
    salvar(novas);
  };

  const adicionarEtapa = () => {
    const nova = {
      id: novoId(),
      nome: 'Nova etapa',
      descricao: '',
      objetivo: '',
      perguntas: [],
      conhecimento: '',
      condicao: '',
      acao: '',
    };

    const novas = [...etapas, nova];
    salvar(novas);
    setSelecionada(nova.id);
  };

  const removerEtapa = () => {
    if (!etapaAtual || etapas.length <= 1) return;

    const novas = etapas.filter((e) => e.id !== selecionada);
    salvar(novas);
    setSelecionada(novas[Math.max(0, etapas.findIndex((e) => e.id === selecionada) - 1)]?.id || novas[0].id);
  };

  const moverEtapa = (direcao) => {
    const index = etapas.findIndex((e) => e.id === selecionada);
    const novoIndex = index + direcao;

    if (index < 0 || novoIndex < 0 || novoIndex >= etapas.length) return;

    const novas = [...etapas];
    [novas[index], novas[novoIndex]] = [novas[novoIndex], novas[index]];
    salvar(novas);
  };

  const adicionarPergunta = () => {
    if (!etapaAtual) return;
    atualizarEtapa('perguntas', [...(etapaAtual.perguntas || []), 'Nova pergunta']);
  };

  const atualizarPergunta = (index, valor) => {
    const perguntas = [...(etapaAtual.perguntas || [])];
    perguntas[index] = valor;
    atualizarEtapa('perguntas', perguntas);
  };

  const removerPergunta = (index) => {
    atualizarEtapa(
      'perguntas',
      (etapaAtual.perguntas || []).filter((_, i) => i !== index)
    );
  };

  const resumo = useMemo(() => ({
    etapas: etapas.length,
    perguntas: etapas.reduce((n, e) => n + (e.perguntas?.length || 0), 0),
    conhecimento: etapas.filter((e) => e.conhecimento?.trim()).length,
  }), [etapas]);

  return (
    <div className="min-h-full bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            {editandoNome ? (
              <input
                autoFocus
                value={nomeFunil}
                onChange={(e) => setNomeFunil(e.target.value)}
                onBlur={() => {
                  setEditandoNome(false);
                  salvar(etapas, nomeFunil);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setEditandoNome(false);
                    salvar(etapas, nomeFunil);
                  }
                }}
                className="rounded-lg border border-blue-300 px-3 py-2 text-2xl font-bold outline-none"
              />
            ) : (
              <button
                onClick={() => setEditandoNome(true)}
                className="text-left text-2xl font-bold text-slate-900 hover:text-blue-600"
              >
                {nomeFunil}
              </button>
            )}
            <p className="mt-1 text-sm text-slate-500">
              Constrói o processo comercial que o chatbot deve seguir.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setModo('funil')}
              className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                modo === 'funil' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              Construtor
            </button>
            <button
              onClick={() => setModo('agente')}
              className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                modo === 'agente' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              Conhecimento do chatbot
            </button>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Etapas</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">{resumo.etapas}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Perguntas</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">{resumo.perguntas}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Etapas com conhecimento</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">{resumo.conhecimento}/{totalEtapas}</div>
          </div>
        </div>

        {modo === 'funil' ? (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_430px]">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-slate-900">Construtor do funil</h2>
                  <p className="text-sm text-slate-500">Define a jornada que cada lead deve percorrer.</p>
                </div>
                <button
                  onClick={adicionarEtapa}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  + Nova etapa
                </button>
              </div>

              <div className="overflow-x-auto pb-4">
                <div className="flex min-w-max items-center gap-3">
                  {etapas.map((etapa, index) => (
                    <div key={etapa.id} className="flex items-center gap-3">
                      <button
                        onClick={() => setSelecionada(etapa.id)}
                        className={`w-64 rounded-2xl border-2 p-4 text-left transition ${
                          selecionada === etapa.id
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-slate-200 bg-white hover:border-blue-200'
                        }`}
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase text-slate-500">
                            Etapa {index + 1}
                          </span>
                          <span className="text-slate-400">→</span>
                        </div>
                        <div className="font-bold text-slate-900">{etapa.nome}</div>
                        <div className="mt-1 line-clamp-2 text-xs text-slate-500">
                          {etapa.descricao || 'Sem descrição'}
                        </div>
                        <div className="mt-4 text-xs font-semibold text-blue-600">
                          {(etapa.perguntas || []).length} perguntas
                        </div>
                      </button>

                      {index < etapas.length - 1 && (
                        <div className="text-xl font-bold text-slate-300">→</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                <strong className="text-slate-900">Como funciona:</strong> o chatbot utiliza
                a etapa atual, o conhecimento, as perguntas e as condições para decidir
                o próximo passo da conversa.
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              {etapaAtual ? (
                <>
                  <div className="mb-5 flex items-start justify-between">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                        Configuração da etapa
                      </div>
                      <h2 className="mt-1 text-xl font-bold text-slate-900">{etapaAtual.nome}</h2>
                    </div>
                    <button
                      onClick={removerEtapa}
                      disabled={etapas.length <= 1}
                      className="text-xs font-semibold text-red-500 disabled:opacity-30"
                    >
                      Eliminar
                    </button>
                  </div>

                  <div className="space-y-4">
                    <label className="block">
                      <span className="mb-1 block text-xs font-semibold text-slate-500">Nome da etapa</span>
                      <input
                        value={etapaAtual.nome}
                        onChange={(e) => atualizarEtapa('nome', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-1 block text-xs font-semibold text-slate-500">Descrição</span>
                      <textarea
                        value={etapaAtual.descricao}
                        onChange={(e) => atualizarEtapa('descricao', e.target.value)}
                        rows="2"
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-1 block text-xs font-semibold text-slate-500">Objetivo do chatbot</span>
                      <textarea
                        value={etapaAtual.objetivo}
                        onChange={(e) => atualizarEtapa('objetivo', e.target.value)}
                        rows="3"
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-1 block text-xs font-semibold text-slate-500">Conhecimento / instruções</span>
                      <textarea
                        value={etapaAtual.conhecimento}
                        onChange={(e) => atualizarEtapa('conhecimento', e.target.value)}
                        rows="5"
                        placeholder="Escreve tudo o que o chatbot deve saber nesta etapa..."
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                      />
                    </label>

                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500">Perguntas que o chatbot deve fazer</span>
                        <button
                          onClick={adicionarPergunta}
                          className="text-xs font-bold text-blue-600"
                        >
                          + Adicionar
                        </button>
                      </div>

                      <div className="space-y-2">
                        {(etapaAtual.perguntas || []).map((pergunta, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              value={pergunta}
                              onChange={(e) => atualizarPergunta(index, e.target.value)}
                              className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                            />
                            <button
                              onClick={() => removerPergunta(index)}
                              className="px-2 text-slate-400 hover:text-red-500"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <label className="block">
                      <span className="mb-1 block text-xs font-semibold text-slate-500">Condição para avançar</span>
                      <textarea
                        value={etapaAtual.condicao}
                        onChange={(e) => atualizarEtapa('condicao', e.target.value)}
                        rows="2"
                        placeholder="Ex.: cliente demonstrou intenção de compra"
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-1 block text-xs font-semibold text-slate-500">Próxima ação</span>
                      <input
                        value={etapaAtual.acao}
                        onChange={(e) => atualizarEtapa('acao', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                      />
                    </label>

                    <div className="flex gap-2 border-t border-slate-100 pt-4">
                      <button
                        onClick={() => moverEtapa(-1)}
                        className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600"
                      >
                        ← Mover
                      </button>
                      <button
                        onClick={() => moverEtapa(1)}
                        className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600"
                      >
                        Mover →
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-20 text-center text-slate-400">Seleciona uma etapa.</div>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900">Conhecimento do chatbot</h2>
              <p className="mt-1 text-sm text-slate-500">
                Aqui está a lógica comercial que o agente poderá utilizar durante as conversas.
              </p>
            </div>

            <div className="space-y-4">
              {etapas.map((etapa, index) => (
                <div key={etapa.id} className="rounded-2xl border border-slate-200 p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase text-blue-600">Etapa {index + 1}</span>
                      <h3 className="font-bold text-slate-900">{etapa.nome}</h3>
                    </div>
                    <button
                      onClick={() => {
                        setSelecionada(etapa.id);
                        setModo('funil');
                      }}
                      className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600"
                    >
                      Editar etapa
                    </button>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="text-[10px] font-bold uppercase text-slate-400">Objetivo</div>
                      <p className="mt-1 text-sm text-slate-700">{etapa.objetivo || 'Não definido'}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="text-[10px] font-bold uppercase text-slate-400">Condição</div>
                      <p className="mt-1 text-sm text-slate-700">{etapa.condicao || 'Não definida'}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="text-[10px] font-bold uppercase text-slate-400">Próxima ação</div>
                      <p className="mt-1 text-sm text-slate-700">{etapa.acao || 'Não definida'}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="text-[10px] font-bold uppercase text-slate-400">Condição</div>
                      <p className="mt-1 text-sm text-slate-700">{etapa.condicao || 'Não definida'}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="text-[10px] font-bold uppercase text-slate-400">Próxima ação</div>
                      <p className="mt-1 text-sm text-slate-700">{etapa.acao || 'Não definida'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
