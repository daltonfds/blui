import { useEffect, useState } from 'react';
import LayoutApp from '../components/LayoutApp.jsx';
import { api } from '../lib/api.js';

export default function Remarketing() {
  const [automacoes, setAutomacoes] = useState([]);
  const [ativo, setAtivo] = useState(true);
  const [mensagem22, setMensagem22] = useState('');
  const [mensagem7, setMensagem7] = useState('');
  const [segmento, setSegmento] = useState('todos');
  const [estado, setEstado] = useState('');

  async function carregar() {
    try {
      const data = await api.get('/api/automacoes');
      const item = data.find(a => a.tipo === 'remarketing');
      setAutomacoes(data);
      if (item) {
        setAtivo(item.ativo);
        setMensagem22(item.configuracao?.mensagem_22h || '');
        setMensagem7(item.configuracao?.mensagem_7d || '');
        setSegmento(item.configuracao?.segmento || 'todos');
      }
    } catch (e) {
      setEstado(e.message);
    }
  }

  useEffect(() => { carregar(); }, []);

  async function guardar() {
    setEstado('');
    try {
      const item = automacoes.find(a => a.tipo === 'remarketing');
      const configuracao = {
        atraso_1_horas: 22,
        atraso_2_dias: 7,
        mensagem_22h: mensagem22,
        mensagem_7d: mensagem7,
        segmento,
      };

      if (item) {
        await api.patch(`/api/automacoes/${item.id}`, { ativo, configuracao });
      } else {
        await api.post('/api/automacoes', {
          nome: 'Remarketing WhatsApp',
          tipo: 'remarketing',
          configuracao,
        });
      }

      setEstado('Remarketing guardado.');
      carregar();
    } catch (e) {
      setEstado(e.message);
    }
  }

  return (
    <LayoutApp>
      <div className="max-w-4xl">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold">Remarketing</h1>
          <p className="mt-1 text-sm text-base-ink/55">
            Recupera conversas sem resposta através do WhatsApp.
          </p>
        </header>

        {estado && <p className="mb-5 text-sm text-base-ink/60">{estado}</p>}

        <section className="rounded-xs border border-black/5 bg-base-white p-6 space-y-5">
          <label className="flex items-center justify-between border-b border-black/5 pb-4">
            <div>
              <p className="font-medium">Remarketing ativo</p>
              <p className="mt-1 text-sm text-base-ink/50">Executado pelo scheduler do backend.</p>
            </div>
            <input type="checkbox" checked={ativo} onChange={e => setAtivo(e.target.checked)} />
          </label>

          <Field label="Segmentação">
            <select value={segmento} onChange={e => setSegmento(e.target.value)} className="input-v05">
              <option value="todos">Todos os leads elegíveis</option>
              <option value="pendente">Pendentes</option>
              <option value="nao_respondeu">Não respondeu</option>
            </select>
          </Field>

          <div className="rounded-xs border border-black/5 p-5">
            <p className="font-medium">Primeiro follow-up</p>
            <p className="mt-1 text-sm text-base-ink/50">22 horas depois da última interação.</p>
            <textarea value={mensagem22} onChange={e => setMensagem22(e.target.value)} className="input-v05 mt-4" rows={4} placeholder="Mensagem de follow-up às 22 horas." />
          </div>

          <div className="rounded-xs border border-black/5 p-5">
            <p className="font-medium">Segundo follow-up</p>
            <p className="mt-1 text-sm text-base-ink/50">7 dias depois do primeiro follow-up.</p>
            <textarea value={mensagem7} onChange={e => setMensagem7(e.target.value)} className="input-v05 mt-4" rows={4} placeholder="Mensagem de reativação aos 7 dias." />
          </div>

          <button onClick={guardar} className="rounded-xs bg-brand-500 px-5 py-2.5 text-sm font-medium text-white">
            Guardar remarketing
          </button>
        </section>
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
