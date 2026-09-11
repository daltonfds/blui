import { useEffect, useState } from 'react';
import LayoutApp from '../components/LayoutApp.jsx';
import { api } from '../lib/api.js';

const vazio = {
  nome_produto: '',
  sobre_produto: '',
  preco: '',
  custo: '',
  forma_entrega: '',
  forma_pagamento: '',
  regras_agente: '',
  perguntas_frequentes: [],
  script_abertura: '',
  script_remarketing_24h: '',
};

export default function Treino() {
  const [produtos, setProdutos] = useState([]);
  const [produto, setProduto] = useState(vazio);
  const [selecionado, setSelecionado] = useState(null);
  const [instrucoes, setInstrucoes] = useState('');
  const [negociacao, setNegociacao] = useState({
    ativa: false,
    desconto_maximo: 0,
    frete_gratis: false,
  });
  const [estado, setEstado] = useState('');

  async function carregar() {
    try {
      const [lista, treino] = await Promise.all([
        api.get('/api/produtos'),
        api.get('/api/ai/treino'),
      ]);
      setProdutos(lista || []);
      setInstrucoes(treino?.instrucoes || '');
      setNegociacao(treino?.negociacao || {
        ativa: false,
        desconto_maximo: 0,
        frete_gratis: false,
      });
    } catch (e) {
      setEstado(e.message);
    }
  }

  useEffect(() => { carregar(); }, []);

  function editar(p) {
    setSelecionado(p.id);
    setProduto({
      ...vazio,
      ...p,
      preco: p.preco ?? '',
      custo: p.custo ?? '',
      perguntas_frequentes: p.perguntas_frequentes || [],
    });
  }

  async function guardarProduto(e) {
    e.preventDefault();
    try {
      const body = {
        ...produto,
        preco: produto.preco === '' ? null : Number(produto.preco),
        custo: produto.custo === '' ? null : Number(produto.custo),
      };

      if (selecionado) {
        await api.put(`/api/produtos/${selecionado}`, body);
      } else {
        await api.post('/api/produtos', body);
      }

      setProduto(vazio);
      setSelecionado(null);
      setEstado('Produto guardado.');
      carregar();
    } catch (e) {
      setEstado(e.message);
    }
  }

  async function guardarTreino(e) {
    e.preventDefault();
    try {
      await api.put('/api/ai/treino', { instrucoes, negociacao });
      setEstado('Treino guardado.');
    } catch (e) {
      setEstado(e.message);
    }
  }

  return (
    <LayoutApp>
      <div className="max-w-6xl">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold">Treino do chatbot</h1>
          <p className="mt-1 text-sm text-base-ink/55">
            Uma base única para o chatbot entender cada produto, preço e regra sem misturar ofertas.
          </p>
        </header>

        {estado && <p className="mb-5 text-sm text-base-ink/60">{estado}</p>}

        <div className="grid gap-5 lg:grid-cols-[250px_1fr]">
          <aside className="rounded-xs border border-black/5 bg-base-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-medium">Produtos</h2>
              <button onClick={() => { setSelecionado(null); setProduto(vazio); }} className="text-sm text-brand-600">Novo</button>
            </div>

            <div className="space-y-1">
              {produtos.map(p => (
                <button
                  key={p.id}
                  onClick={() => editar(p)}
                  className={`w-full rounded-xs p-3 text-left text-sm ${
                    selecionado === p.id ? 'bg-brand-50 text-brand-700' : 'hover:bg-base-fog'
                  }`}
                >
                  <span className="font-medium">{p.nome_produto}</span>
                  <span className="block text-xs text-base-ink/45">{p.preco ?? 'Preço não definido'}</span>
                </button>
              ))}
            </div>
          </aside>

          <form onSubmit={guardarProduto} className="rounded-xs border border-black/5 bg-base-white p-5 space-y-4">
            <Field label="Nome"><input required value={produto.nome_produto} onChange={e => setProduto({...produto,nome_produto:e.target.value})} className="input-v05" /></Field>
            <Field label="Descrição"><textarea value={produto.sobre_produto} onChange={e => setProduto({...produto,sobre_produto:e.target.value})} className="input-v05" rows={4} /></Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Preço"><input type="number" step="0.01" value={produto.preco} onChange={e => setProduto({...produto,preco:e.target.value})} className="input-v05" /></Field>
              <Field label="Custo"><input type="number" step="0.01" value={produto.custo} onChange={e => setProduto({...produto,custo:e.target.value})} className="input-v05" /></Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Entrega"><input value={produto.forma_entrega} onChange={e => setProduto({...produto,forma_entrega:e.target.value})} className="input-v05" /></Field>
              <Field label="Pagamento"><input value={produto.forma_pagamento} onChange={e => setProduto({...produto,forma_pagamento:e.target.value})} className="input-v05" /></Field>
            </div>

            <Field label="Regras do produto"><textarea value={produto.regras_agente || ''} onChange={e => setProduto({...produto,regras_agente:e.target.value})} className="input-v05" rows={4} placeholder="Regras específicas para este produto." /></Field>
            <Field label="Perguntas frequentes"><textarea value={(produto.perguntas_frequentes || []).join('\n')} onChange={e => setProduto({...produto,perguntas_frequentes:e.target.value.split('\n').filter(Boolean)})} className="input-v05" rows={4} placeholder="Uma pergunta por linha." /></Field>
            <Field label="Mensagem de follow-up"><textarea value={produto.script_remarketing_24h || ''} onChange={e => setProduto({...produto,script_remarketing_24h:e.target.value})} className="input-v05" rows={3} /></Field>

            <button className="rounded-xs bg-base-ink px-5 py-2.5 text-sm font-medium text-white">
              Guardar produto
            </button>
          </form>
        </div>

        <form onSubmit={guardarTreino} className="mt-5 rounded-xs border border-black/5 bg-base-white p-5 space-y-5">
          <div>
            <h2 className="font-medium">Treino geral</h2>
            <p className="mt-1 text-sm text-base-ink/50">
              Estas instruções aplicam-se ao chatbot em todas as conversas.
            </p>
          </div>

          <textarea value={instrucoes} onChange={e => setInstrucoes(e.target.value)} className="input-v05" rows={8} placeholder="Tom de voz, regras de atendimento, perguntas obrigatórias e limites." />

          <div className="grid gap-5 md:grid-cols-3">
            <label className="flex items-center gap-3 text-sm">
              <input type="checkbox" checked={negociacao.ativa} onChange={e => setNegociacao({...negociacao,ativa:e.target.checked})} />
              Permitir negociação
            </label>

            <Field label="Desconto máximo">
              <input type="number" min="0" max="100" step="0.5" value={negociacao.desconto_maximo} onChange={e => setNegociacao({...negociacao,desconto_maximo:Number(e.target.value)})} className="input-v05" />
            </Field>

            <label className="flex items-center gap-3 text-sm md:pt-7">
              <input type="checkbox" checked={negociacao.frete_gratis} onChange={e => setNegociacao({...negociacao,frete_gratis:e.target.checked})} />
              Permitir frete grátis
            </label>
          </div>

          <button className="rounded-xs bg-brand-500 px-5 py-2.5 text-sm font-medium text-white">
            Guardar treino
          </button>
        </form>
      </div>
    </LayoutApp>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-base-ink/60">{label}</span>
      {children}
    </label>
  );
}
