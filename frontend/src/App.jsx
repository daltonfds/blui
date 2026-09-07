import 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Landing from './pages/Landing.jsx';
import Autenticacao from './pages/Autenticacao.jsx';
import Painel from './pages/Painel.jsx';
import Contactos from './pages/Contactos.jsx';
import Produtos from './pages/Produtos.jsx';
import Campanhas from './pages/Campanhas.jsx';
import Definicoes from './pages/Definicoes.jsx';
import Numeros from './pages/Numeros.jsx';
import RotaProtegida from './components/RotaProtegida.jsx';

const ModulePage = ({ title, description, items = [] }) => (
  <div className="min-h-screen bg-base-fog p-6 md:p-8">
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
          BLUI
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-base-ink">{title}</h1>
        <p className="mt-2 text-sm text-base-ink/60">{description}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div
            key={item}
            className="rounded-xl border border-black/5 bg-base-white p-5 shadow-sm"
          >
            <h2 className="font-semibold text-base-ink">{item}</h2>
            <p className="mt-2 text-sm text-base-ink/50">
              Este módulo está preparado para receber os dados e ações do BLUI.
            </p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const modules = {
  conversas: ['Conversas', 'WhatsApp, Instagram, Messenger e Site num único espaço.', ['WhatsApp', 'Instagram', 'Messenger', 'Site']],
  loja: ['Loja', 'Produtos, pedidos, carrinhos e checkout.', ['Loja', 'Pedidos', 'Carrinhos', 'Checkout']],
  sites: ['Sites', 'Landing pages, páginas de venda, formulários e domínios.', ['Landing pages', 'Páginas de venda', 'Formulários', 'Domínios']],
  automacoes: ['Automações', 'Fluxos de remarketing e recuperação automática.', ['Remarketing', 'Carrinho abandonado', 'Checkout abandonado', 'Pós-venda', 'Reativação']],
  analytics: ['Analytics', 'Métricas de visitantes, leads, conversas e vendas.', ['Visitantes', 'Leads', 'Conversas', 'Vendas', 'Receita', 'ROI / ROAS']],
};

function Generic({ type }) {
  const [title, description, items] = modules[type];
  return <ModulePage title={title} description={description} items={items} />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/entrar" element={<Autenticacao abaInicial="entrar" />} />
      <Route path="/registar" element={<Autenticacao abaInicial="registar" />} />

      <Route path="/painel" element={<RotaProtegida><Painel /></RotaProtegida>} />
      <Route path="/contactos" element={<RotaProtegida><Contactos /></RotaProtegida>} />
      <Route path="/produtos" element={<RotaProtegida><Produtos /></RotaProtegida>} />
      <Route path="/campanhas" element={<RotaProtegida><Campanhas /></RotaProtegida>} />
      <Route path="/definicoes" element={<RotaProtegida><Definicoes /></RotaProtegida>} />
      <Route path="/numeros" element={<RotaProtegida><Numeros /></RotaProtegida>} />

      <Route path="/conversas" element={<RotaProtegida><Generic type="conversas" /></RotaProtegida>} />
      <Route path="/loja" element={<RotaProtegida><Generic type="loja" /></RotaProtegida>} />
      <Route path="/sites" element={<RotaProtegida><Generic type="sites" /></RotaProtegida>} />
      <Route path="/automacoes" element={<RotaProtegida><Generic type="automacoes" /></RotaProtegida>} />
      <Route path="/analytics" element={<RotaProtegida><Generic type="analytics" /></RotaProtegida>} />

      <Route path="*" element={<Navigate to="/painel" replace />} />
    </Routes>
  );
}
