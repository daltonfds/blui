import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api.js';

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
  const [funilId, setFunilId] = useState(null);
  const [etapas, setEtapas] = useState([]);
  const [nomeFunil, setNomeFunil] = useState('Funil de Vendas');
  const [objetivoFunil, setObjetivoFunil] = useState('');
  const [selecionada, setSelecionada] = useState(null);
  const [modo, setModo] = useState('funil');
  const [carregando, setCarregando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

  const etapaAtual = etapas.find((e) => e.id === selecionada) || etapas[0];

  const carregar = async () => {
    setCarregando(true);
    setErro('');

    try {
      const resposta = await api.get('/api/funil');
      const funil = resposta.funis?.[0];

      if (funil) {
        const lista = (funil.funnel_stages || [])
          .sort((a, b) => a.ordem - b.ordem);

        setFunilId(funil.id);
        setNomeFunil(funil.nome || 'Funil de Vendas');
        setObjetivoFunil(funil.objetivo || '');
        setEtapas(lista);
        setSelecionada(lista[0]?.id || null);

        localStorage.setItem('blui_funil', JSON.stringify(lista));
        localStorage.setItem('blui_funil_nome', funil.nome || 'Funil de Vendas');
      } else {
        const locais = JSON.parse(
          localStorage.getItem('blui_funil') || 'null'
        );

        const lista = locais?.length ? locais : etapasIniciais;

        setEtapas(lista);
        setSelecionada(lista[0]?.id || null);
      }
    } catch (e) {
      setErro(e.message || 'Não foi possível carregar o funil.');

      const locais = JSON.parse(
        localStorage.getItem('blui_funil') || 'null'
      );

      const lista = locais?.length ? locais : etapasIniciais;

      setEtapas(lista);
      setSelecionada(lista[0]?.id || null);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  const guardarTudo = async () => {
    setGuardando(true);
    setMensagem('');
    setErro('');

    try {
      let id = funilId;

      if (!id) {
        const criado = await api.post('/api/funil', {
          nome: nomeFunil,
          objetivo: objetivoFunil,
          etapas: etapas.map(({ id: _id, ...etapa }) => etapa),
        });

        id = criado.funil.id;

        const lista = criado.funil.funnel_stages || [];

        setFunilId(id);
        setEtapas(lista);
        setSelecionada(lista[0]?.id || null);
      } else {
        await api.put(`/api/funil/${id}`, {
          nome: nomeFunil,
          objetivo: objetivoFunil,
          ativo: true,
        });

        const servidor = await api.get('/api/funil');
        const atual = servidor.funis?.find((f) => f.id === id);
        const existentes = new Set(
          (atual?.funnel_stages || []).map((e) => e.id)
        );

        for (let i = 0; i < etapas.length; i++) {
          const etapa = etapas[i];

          if (existentes.has(etapa.id)) {
            await api.put(
              `/api/funil/${id}/etapas/${etapa.id}`,
              { ...etapa, ordem: i }
            );
          } else {
            const resposta = await api.post(
              `/api/funil/${id}/etapas`,
              etapa
            );

            setEtapas((lista) =>
              lista.map((x) =>
                x.id === etapa.id ? resposta.etapa : x
              )
            );
          }
        }

        const ids = etapas
          .map((e) => e.id)
          .filter((id) => !String(id).startsWith('local-'));

        if (ids.length) {
          await api.put(
            `/api/funil/${id}/etapas-ordem`,
            { ids }
          );
        }
      }

      localStorage.setItem(
        'blui_funil',
        JSON.stringify(etapas)
      );

      localStorage.setItem(
        'blui_funil_nome',
        nomeFunil
      );

      setMensagem(
        'Funil guardado e sincronizado com o servidor.'
      );

      setTimeout(() => setMensagem(''), 3000);
    } catch (e) {
      setErro(
        e.message || 'Não foi possível guardar o funil.'
      );
    } finally {
      setGuardando(false);
    }
  };

  const atualizarEtapa = (campo, valor) => {
    setEtapas((lista) =>
      lista.map((e) =>
        e.id === selecionada
          ? { ...e, [campo]: valor }
          : e
      )
    );
  };

  const adicionarEtapa = () => {
    const nova = {
      id: `local-${Date.now()}`,
      nome: 'Nova etapa',
      descricao: '',
      objetivo: '',
      perguntas: [],
      conhecimento: '',
      condicao: '',
      acao: '',
    };

    setEtapas((lista) => [...lista, nova]);
    setSelecionada(nova.id);
  };

  const removerEtapa = async () => {
    if (!etapaAtual || etapas.length <= 1) return;

    try {
      if (
        funilId &&
        !String(etapaAtual.id).startsWith('local-')
      ) {
        await api.del(
          `/api/funil/${funilId}/etapas/${etapaAtual.id}`
        );
      }

      const lista = etapas.filter(
        (e) => e.id !== etapaAtual.id
      );

      setEtapas(lista);
      setSelecionada(lista[0]?.id || null);
    } catch (e) {
      setErro(e.message);
    }
  };

  const moverEtapa = (direcao) => {
    const i = etapas.findIndex(
      (e) => e.id === selecionada
    );

    const j = i + direcao;

    if (
      i < 0 ||
      j < 0 ||
      j >= etapas.length
    ) return;

    const lista = [...etapas];

    [lista[i], lista[j]] = [
      lista[j],
      lista[i],
    ];

    setEtapas(lista);
  };

  const resumo = useMemo(() => ({
    etapas: etapas.length,
    perguntas: etapas.reduce((n, e) => n + (e.perguntas?.length || 0), 0),
    conhecimento: etapas.filter((e) => e.conhecimento?.trim()).length,
  }), [etapas]);

  if (carregando) {
    return (
      <div className="flex min-h-full items-center justify-center bg-slate-50 p-8 text-sm text-slate-500">
        A carregar o funil...
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            {editandoNome ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={nomeFunil}
                  onChange={(e) => setNomeFunil(e.target.value)}
                  onBlur={() => {
                    setEditandoNome(false);
                    localStorage.setItem("blui_funil_nome", nomeFunil);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setEditandoNome(false);
                      localStorage.setItem("blui_funil_nome", nomeFunil);
                    }
                  }}
                  className="rounded-lg border border-blue-300 px-3 py-2 text-2xl font-bold outline-none"
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setEditandoNome(true)}
                className="text-left text-2xl font-bold text-slate-900 hover:text-blue-600"
              >
                {nomeFunil}
              </button>
            )}

            <input
              value={objetivoFunil}
              onChange={(e) => setObjetivoFunil(e.target.value)}
              placeholder="Objetivo do funil (opcional)"
              className="mt-1 w-full max-w-xl rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />

            <p className="mt-1 text-sm text-slate-500">
              Constrói o processo comercial que o chatbot deve seguir.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={guardarTudo}
              disabled={guardando}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {guardando ? 'A guardar...' : 'Guardar funil'}
            </button>
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

        {(mensagem || erro) && (
          <div className={`mb-5 rounded-xl border p-3 text-sm ${
            erro
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700'
          }`}>
            {erro || mensagem}
          </div>
        )}

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
