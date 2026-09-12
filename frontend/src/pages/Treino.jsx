import { useEffect, useState } from 'react';
import LayoutApp from '../components/LayoutApp.jsx';
import { api } from '../lib/api.js';

const VAZIO = {
  nome_produto: '',
  sobre_produto: '',
  preco: '',
  custo: '',
  forma_entrega: '',
  forma_pagamento: '',
  idioma: 'pt',
  regras_agente: '',
  perguntas_frequentes: [],
  script_abertura: '',
  script_remarketing_24h: '',
  ativo: true,
};

export default function Treino() {
  const [produtos, setProdutos] = useState([]);
  const [produto, setProduto] = useState(VAZIO);
  const [selecionado, setSelecionado] = useState(null);
  const [instrucoes, setInstrucoes] = useState('');
  const [negociacao, setNegociacao] = useState({
    ativa: false,
    desconto_maximo: 0,
    frete_gratis: false,
  });
  const [estado, setEstado] = useState('');
  const [erro, setErro] = useState('');
  const [guardando, setGuardando] = useState(false);

  async function carregar() {
    try {
      const [lista, treino] = await Promise.all([
        api.get('/api/produtos'),
        api.get('/api/ai/treino'),
      ]);

      setProdutos(lista || []);
      setInstrucoes(treino?.instrucoes || '');

      setNegociacao(
        treino?.negociacao || {
          ativa: false,
          desconto_maximo: 0,
          frete_gratis: false,
        }
      );
    } catch (e) {
      setErro(e.message);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function editar(p) {
    setErro('');
    setEstado('');
    setSelecionado(p.id);

    setProduto({
      ...VAZIO,
      ...p,
      preco: p.preco ?? '',
      custo: p.custo ?? '',
      perguntas_frequentes:
        Array.isArray(p.perguntas_frequentes)
          ? p.perguntas_frequentes
          : [],
    });
  }

  function novoProduto() {
    setSelecionado(null);
    setProduto(VAZIO);
    setEstado('');
    setErro('');
  }

  async function guardarProduto(e) {
    e.preventDefault();

    setGuardando(true);
    setErro('');
    setEstado('');

    try {
      const body = {
        ...produto,
        preco:
          produto.preco === ''
            ? null
            : Number(produto.preco),
        custo:
          produto.custo === ''
            ? null
            : Number(produto.custo),
      };

      const resposta = selecionado
        ? await api.put(
            `/api/produtos/${selecionado}`,
            body
          )
        : await api.post('/api/produtos', body);

      const salvo = resposta?.produto;

      if (salvo) {
        setProdutos((anteriores) => {
          const existe = anteriores.some(
            (p) => p.id === salvo.id
          );

          if (existe) {
            return anteriores.map((p) =>
              p.id === salvo.id ? salvo : p
            );
          }

          return [salvo, ...anteriores];
        });
      }

      setSelecionado(salvo?.id || selecionado || null);
      setProduto({
        ...VAZIO,
        ...(salvo || body),
        perguntas_frequentes:
          salvo?.perguntas_frequentes ||
          body.perguntas_frequentes ||
          [],
      });

      setEstado(
        'Produto e treino guardados com sucesso.'
      );
    } catch (e) {
      setErro(e.message);
    } finally {
      setGuardando(false);
    }
  }

  async function guardarTreino(e) {
    e.preventDefault();

    try {
      await api.put('/api/ai/treino', {
        instrucoes,
        negociacao,
      });

      setEstado('Treino geral guardado com sucesso.');
      setErro('');
    } catch (e) {
      setErro(e.message);
    }
  }

  return (
    <LayoutApp>
      <div className="max-w-6xl">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold">
            Treino do chatbot
          </h1>

          <p className="mt-1 text-sm text-base-ink/55">
            Cria o conhecimento do chatbot por produto.
            Cada produto tem preço, entrega, pagamento,
            perguntas, regras e mensagem inicial próprios.
          </p>
        </header>

        {estado && (
          <div className="mb-5 rounded-xs border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {estado}
          </div>
        )}

        {erro && (
          <div className="mb-5 rounded-xs border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {erro}
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-[250px_1fr]">
          <aside className="rounded-xs border border-black/5 bg-base-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-medium">Produtos</h2>

              <button
                type="button"
                onClick={novoProduto}
                className="text-sm text-brand-600"
              >
                Novo
              </button>
            </div>

            <div className="space-y-1">
              {produtos.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => editar(p)}
                  className={`w-full rounded-xs p-3 text-left text-sm ${
                    selecionado === p.id
                      ? 'bg-brand-50 text-brand-700'
                      : 'hover:bg-base-fog'
                  }`}
                >
                  <span className="font-medium">
                    {p.nome_produto}
                  </span>

                  <span className="block text-xs text-base-ink/45">
                    {p.preco !== null &&
                    p.preco !== undefined
                      ? `${p.preco}`
                      : 'Preço não definido'}
                  </span>
                </button>
              ))}

              {produtos.length === 0 && (
                <p className="px-2 py-4 text-xs text-base-ink/40">
Nenhum produto criado.
                </p>
              )}
            </div>
          </aside>

          <form
            onSubmit={guardarProduto}
            className="space-y-4 rounded-xs border border-black/5 bg-base-white p-5"
          >
            <div>
              <h2 className="font-medium">
                {selecionado
                  ? 'Editar treino do produto'
                  : 'Novo treino de produto'}
              </h2>

              <p className="mt-1 text-xs text-base-ink/45">
                Estas informações ficam ligadas somente a este produto.
              </p>
            </div>

            <Field label="Nome do produto">
              <input
                required
                value={produto.nome_produto}
                onChange={(e) =>
                  setProduto({
                    ...produto,
                    nome_produto: e.target.value,
                  })
                }
                className="input-v05"
              />
            </Field>

            <Field label="Descrição do produto">
              <textarea
                value={produto.sobre_produto}
                onChange={(e) =>
                  setProduto({
                    ...produto,
                    sobre_produto: e.target.value,
                  })
                }
                className="input-v05"
                rows={5}
              />
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Preço de venda">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={produto.preco}
                  onChange={(e) =>
                    setProduto({
                      ...produto,
                      preco: e.target.value,
                    })
                  }
                  className="input-v05"
                  placeholder="Ex.: 500"
                />
              </Field>

              <Field label="Custo interno">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={produto.custo}
                  onChange={(e) =>
                    setProduto({
                      ...produto,
                      custo: e.target.value,
                    })
                  }
                  className="input-v05"
                  placeholder="Ex.: 200"
                />
              </Field>
            </div>

            <div className="rounded-xs border border-black/5 bg-base-fog p-4 text-xs text-base-ink/55">
              O preço é o valor apresentado ao cliente.
              O custo é apenas interno e serve para controlo
              da margem. O chatbot não deve revelar o custo.
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Forma de entrega">
                <input
                  value={produto.forma_entrega}
                  onChange={(e) =>
                    setProduto({
                      ...produto,
                      forma_entrega: e.target.value,
                    })
                  }
                  className="input-v05"
                  placeholder="Ex.: entrega em 24h"
                />
              </Field>

              <Field label="Forma de pagamento">
                <input
                  value={produto.forma_pagamento}
                  onChange={(e) =>
                    setProduto({
                      ...produto,
                      forma_pagamento: e.target.value,
                    })
                  }
                  className="input-v05"
                  placeholder="Ex.: M-Pesa"
                />
              </Field>
            </div>

            <Field label="Mensagem inicial">
              <textarea
                required
                value={produto.script_abertura}
                onChange={(e) =>
                  setProduto({
                    ...produto,
                    script_abertura: e.target.value,
                  })
                }
                className="input-v05"
                rows={4}
                placeholder="Mensagem que o chatbot deve usar para iniciar e identificar o interesse pelo produto."
              />
            </Field>

            <div className="rounded-xs border border-brand-100 bg-brand-50 p-4 text-sm text-brand-800">
              A mensagem inicial ajuda o chatbot a identificar
              o produto e iniciar a conversa usando este treino.
            </div>

            <Field label="Perguntas frequentes">
              <textarea
                value={(
                  produto.perguntas_frequentes || []
                ).join('\n')}
                onChange={(e) =>
                  setProduto({
                    ...produto,
                    perguntas_frequentes:
                      e.target.value
                        .split('\n')
                        .map((v) => v.trim())
                        .filter(Boolean),
                  })
                }
                className="input-v05"
                rows={5}
                placeholder="Uma pergunta por linha."
              />
            </Field>

            <Field label="Regras específicas do produto">
              <textarea
                value={produto.regras_agente || ''}
                onChange={(e) =>
                  setProduto({
                    ...produto,
                    regras_agente: e.target.value,
                  })
                }
                className="input-v05"
                rows={5}
                placeholder="O que o chatbot pode e não pode dizer sobre este produto."
              />
            </Field>

            <Field label="Mensagem de remarketing após 24 horas">
              <textarea
                value={
                  produto.script_remarketing_24h || ''
                }
                onChange={(e) =>
                  setProduto({
                    ...produto,
                    script_remarketing_24h:
                      e.target.value,
                  })
                }
                className="input-v05"
                rows={4}
              />
            </Field>

            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={Boolean(produto.ativo)}
                onChange={(e) =>
                  setProduto({
                    ...produto,
                    ativo: e.target.checked,
                  })
                }
              />
              Produto ativo
            </label>

            <button
              disabled={guardando}
              className="rounded-xs bg-brand-500 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {guardando
                ? 'A guardar...'
                : 'Guardar produto e treino'}
            </button>
          </form>
        </div>

        <form
          onSubmit={guardarTreino}
          className="mt-5 space-y-5 rounded-xs border border-black/5 bg-base-white p-5"
        >
          <div>
            <h2 className="font-medium">
              Comportamento geral do chatbot
            </h2>

            <p className="mt-1 text-sm text-base-ink/50">
              Estas regras são gerais. O conhecimento de produtos
              permanece separado por produto.
            </p>
          </div>

          <textarea
            value={instrucoes}
            onChange={(e) =>
              setInstrucoes(e.target.value)
            }
            className="input-v05"
            rows={8}
            placeholder="Tom de voz, regras gerais de atendimento e limites."
          />

          <div className="grid gap-5 md:grid-cols-3">
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={negociacao.ativa}
                onChange={(e) =>
                  setNegociacao({
                    ...negociacao,
                    ativa: e.target.checked,
                  })
                }
              />
              Permitir negociação
            </label>

            <Field label="Desconto máximo">
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={negociacao.desconto_maximo}
                onChange={(e) =>
                  setNegociacao({
                    ...negociacao,
                    desconto_maximo:
                      Number(e.target.value),
                  })
                }
                className="input-v05"
              />
            </Field>

            <label className="flex items-center gap-3 text-sm md:pt-7">
              <input
                type="checkbox"
                checked={negociacao.frete_gratis}
                onChange={(e) =>
                  setNegociacao({
                    ...negociacao,
                    frete_gratis: e.target.checked,
                  })
                }
              />
              Permitir frete grátis
            </label>
          </div>

          <button className="rounded-xs bg-base-ink px-5 py-2.5 text-sm font-medium text-white">
            Guardar comportamento geral
          </button>
        </form>
      </div>
    </LayoutApp>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-base-ink/60">
        {label}
      </span>
      {children}
    </label>
  );
}
