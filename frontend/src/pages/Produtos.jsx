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
  perguntas_frequentes: [],
  script_abertura: '',
  script_remarketing_24h: '',
  regras_agente: '',
  ativo: true,
};

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [form, setForm] = useState(VAZIO);
  const [editando, setEditando] = useState(null);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [guardando, setGuardando] = useState(false);

  async function carregar() {
    try {
      const data = await api.get('/api/produtos');
      setProdutos(data || []);
    } catch (e) {
      setErro(e.message);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function editar(produto) {
    setEditando(produto.id);
    setMensagem('');
    setErro('');

    setForm({
      ...VAZIO,
      ...produto,
      preco: produto.preco ?? '',
      custo: produto.custo ?? '',
      perguntas_frequentes:
        produto.perguntas_frequentes || [],
    });
  }

  function novo() {
    setEditando(null);
    setForm(VAZIO);
    setMensagem('');
    setErro('');
  }

  async function guardar(e) {
    e.preventDefault();

    setGuardando(true);
    setMensagem('');
    setErro('');

    try {
      const body = {
        ...form,
        preco:
          form.preco === ''
            ? null
            : Number(form.preco),
        custo:
          form.custo === ''
            ? null
            : Number(form.custo),
      };

      const resposta = editando
        ? await api.put(
            `/api/produtos/${editando}`,
            body
          )
        : await api.post('/api/produtos', body);

      const produto = resposta?.produto;

      if (produto) {
        setProdutos((anteriores) => {
          if (editando) {
            return anteriores.map((p) =>
              p.id === produto.id ? produto : p
            );
          }

          return [produto, ...anteriores];
        });
      }

      setMensagem(
        editando
          ? 'Produto atualizado com sucesso.'
          : 'Produto criado e treino guardado com sucesso.'
      );

      novo();
    } catch (e) {
      setErro(e.message);
    } finally {
      setGuardando(false);
    }
  }

  async function alternar(produto) {
    try {
      const resposta = await api.patch(
        `/api/produtos/${produto.id}/estado`,
        { ativo: !produto.ativo }
      );

      const atualizado = resposta?.produto;

      setProdutos((anteriores) =>
        anteriores.map((p) =>
          p.id === produto.id
            ? atualizado || {
                ...p,
                ativo: !p.ativo,
              }
            : p
        )
      );
    } catch (e) {
      setErro(e.message);
    }
  }

  async function eliminar(produto) {
    const confirmar = window.confirm(
      `Eliminar o produto "${produto.nome_produto}"?`
    );

    if (!confirmar) return;

    try {
      await api.del(`/api/produtos/${produto.id}`);

      setProdutos((anteriores) =>
        anteriores.filter((p) => p.id !== produto.id)
      );

      if (editando === produto.id) {
        novo();
      }

      setMensagem('Produto eliminado.');
    } catch (e) {
      setErro(e.message);
    }
  }

  return (
    <LayoutApp>
      <div className="max-w-7xl">
        <header className="mb-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold">
                Produtos
              </h1>

              <p className="mt-1 text-sm text-base-ink/55">
                Todos os produtos treinados pelo chatbot.
              </p>
            </div>

            <button
              type="button"
              onClick={novo}
              className="rounded-xs bg-brand-500 px-4 py-2.5 text-sm font-medium text-white"
            >
              Novo produto
            </button>
          </div>
        </header>

        {mensagem && (
          <div className="mb-5 rounded-xs border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {mensagem}
          </div>
        )}

        {erro && (
          <div className="mb-5 rounded-xs border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {erro}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <form
            onSubmit={guardar}
            className="h-fit space-y-4 rounded-xs border border-black/5 bg-base-white p-5"
          >
            <div>
              <h2 className="font-medium">
                {editando
                  ? 'Editar produto'
                  : 'Criar produto'}
              </h2>
            </div>

            <Campo label="Nome">
              <input
                required
                value={form.nome_produto}
                onChange={(e) =>
                  setForm({
                    ...form,
                    nome_produto: e.target.value,
                  })
                }
              />
            </Campo>

            <Campo label="Descrição">
              <textarea
                rows={4}
                value={form.sobre_produto}
                onChange={(e) =>
                  setForm({
                    ...form,
                    sobre_produto: e.target.value,
                  })
                }
              />
            </Campo>

            <div className="grid grid-cols-2 gap-3">
              <Campo label="Preço">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.preco}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      preco: e.target.value,
                    })
                  }
                />
              </Campo>

              <Campo label="Custo">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.custo}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      custo: e.target.value,
                    })
                  }
                />
              </Campo>
            </div>

            <Campo label="Entrega">
              <input
                value={form.forma_entrega}
                onChange={(e) =>
                  setForm({
                    ...form,
                    forma_entrega: e.target.value,
                  })
                }
              />
            </Campo>

            <Campo label="Pagamento">
              <input
                value={form.forma_pagamento}
                onChange={(e) =>
                  setForm({
                    ...form,
                    forma_pagamento: e.target.value,
                  })
                }
              />
            </Campo>

            <Campo label="Mensagem inicial">
              <textarea
                rows={3}
                value={form.script_abertura}
                onChange={(e) =>
                  setForm({
                    ...form,
                    script_abertura: e.target.value,
                  })
                }
              />
            </Campo>

            <Campo label="Perguntas frequentes">
              <textarea
                rows={4}
                value={(form.perguntas_frequentes || []).join('\n')}
                onChange={(e) =>
                  setForm({
                    ...form,
                    perguntas_frequentes:
                      e.target.value
                        .split('\n')
                        .map((v) => v.trim())
                        .filter(Boolean),
                  })
                }
                placeholder="Uma pergunta por linha."
              />
            </Campo>

            <Campo label="Regras do produto">
              <textarea
                rows={4}
                value={form.regras_agente || ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    regras_agente: e.target.value,
                  })
                }
              />
            </Campo>

            <Campo label="Remarketing 24h">
              <textarea
                rows={3}
                value={
                  form.script_remarketing_24h || ''
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    script_remarketing_24h:
                      e.target.value,
                  })
                }
              />
            </Campo>

            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={Boolean(form.ativo)}
                onChange={(e) =>
                  setForm({
                    ...form,
                    ativo: e.target.checked,
                  })
                }
              />
              Produto ativo
            </label>

            <button
              disabled={guardando}
              className="w-full rounded-xs bg-brand-500 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {guardando
                ? 'A guardar...'
                : editando
                  ? 'Guardar alterações'
                  : 'Guardar produto'}
            </button>

            {editando && (
              <button
                type="button"
                onClick={novo}
                className="w-full rounded-xs border border-black/10 py-2.5 text-sm"
              >
                Cancelar edição
              </button>
            )}
          </form>

          <div className="space-y-3">
            {produtos.map((produto) => (
              <article
                key={produto.id}
                className="rounded-xs border border-black/5 bg-base-white p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">
                        {produto.nome_produto}
                      </h3>

                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] ${
                          produto.ativo
                            ? 'bg-green-50 text-green-700'
                            : 'bg-base-fog text-base-ink/45'
                        }`}
                      >
                        {produto.ativo
                          ? 'Ativo'
                          : 'Inativo'}
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-base-ink/55">
                      {produto.sobre_produto ||
                        'Sem descrição.'}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {produto.preco !== null &&
                      produto.preco !== undefined
                        ? produto.preco
                        : 'Preço não definido'}
                    </div>

                    <div className="text-xs text-base-ink/40">
                      {produto.custo !== null &&
                      produto.custo !== undefined
                        ? `Custo interno: ${produto.custo}`
                        : 'Custo não definido'}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => editar(produto)}
                    className="rounded-xs border border-black/10 px-3 py-2 text-xs"
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={() => alternar(produto)}
                    className="rounded-xs border border-black/10 px-3 py-2 text-xs"
                  >
                    {produto.ativo
                      ? 'Desativar'
                      : 'Ativar'}
                  </button>

                  <button
                    type="button"
                    onClick={() => eliminar(produto)}
                    className="rounded-xs border border-red-200 px-3 py-2 text-xs text-red-600"
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            ))}

            {produtos.length === 0 && (
              <div className="rounded-xs border border-dashed border-black/10 p-10 text-center text-sm text-base-ink/40">
                Ainda não existe nenhum produto.
              </div>
            )}
          </div>
        </div>
      </div>
    </LayoutApp>
  );
}

function Campo({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-base-ink/60">
        {label}
      </span>

      <div className="input-produto">
        {children}
      </div>
    </label>
  );
}
