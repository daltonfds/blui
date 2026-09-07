import { Routes, Route, Navigate } from 'react-router-dom';

import Landing from './pages/Landing.jsx';
import Autenticacao from './pages/Autenticacao.jsx';
import Painel from './pages/Painel.jsx';
import Contactos from './pages/Contactos.jsx';
import Produtos from './pages/Produtos.jsx';
import Campanhas from './pages/Campanhas.jsx';
import Definicoes from './pages/Definicoes.jsx';
import Numeros from './pages/Numeros.jsx';
import Analytics from './pages/Analytics.jsx';
import Conversas from './pages/Conversas.jsx';
import Automacoes from './pages/Automacoes.jsx';
import Suporte from './pages/Suporte.jsx';
import Loja from './pages/Loja.jsx';
import Sites from './pages/Sites.jsx';
import RotaProtegida from './components/RotaProtegida.jsx';

const protegida = (element) => (
  <RotaProtegida>{element}</RotaProtegida>
);

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/entrar"
        element={<Autenticacao abaInicial="entrar" />}
      />
      <Route
        path="/registar"
        element={<Autenticacao abaInicial="registar" />}
      />

      {/* PAINEL */}
      <Route path="/painel" element={protegida(<Painel />)} />
      <Route path="/painel/funil" element={protegida(<Painel />)} />
      <Route path="/painel/receita" element={protegida(<Analytics />)} />
      <Route
        path="/painel/oportunidades"
        element={protegida(<Contactos />)}
      />

      {/* CONTACTOS */}
      <Route path="/contactos" element={protegida(<Contactos />)} />
      <Route
        path="/contactos/leads"
        element={protegida(<Contactos />)}
      />
      <Route
        path="/contactos/clientes"
        element={protegida(<Contactos />)}
      />
      <Route
        path="/contactos/segmentos"
        element={protegida(<Contactos />)}
      />
      <Route
        path="/contactos/etiquetas"
        element={protegida(<Contactos />)}
      />

      {/* CONVERSAS */}
      <Route path="/conversas" element={protegida(<Conversas />)} />
      <Route
        path="/conversas/whatsapp"
        element={protegida(<Conversas />)}
      />
      <Route
        path="/conversas/instagram"
        element={protegida(<Conversas />)}
      />
      <Route
        path="/conversas/messenger"
        element={protegida(<Conversas />)}
      />
      <Route
        path="/conversas/site"
        element={protegida(<Conversas />)}
      />

      {/* PRODUTOS */}
      <Route path="/produtos" element={protegida(<Produtos />)} />
      <Route
        path="/produtos/categorias"
        element={protegida(<Produtos />)}
      />
      <Route
        path="/produtos/faq"
        element={protegida(<Produtos />)}
      />
      <Route
        path="/produtos/agente"
        element={protegida(<Produtos />)}
      />

      {/* LOJA */}
      <Route path="/loja" element={protegida(<Loja />)} />
      <Route
        path="/loja/produtos"
        element={protegida(<Loja />)}
      />
      <Route
        path="/loja/pedidos"
        element={protegida(<Loja />)}
      />
      <Route
        path="/loja/carrinhos"
        element={protegida(<Loja />)}
      />
      <Route
        path="/loja/checkout"
        element={protegida(<Loja />)}
      />

      {/* SITES */}
      <Route path="/sites" element={protegida(<Sites />)} />
      <Route
        path="/sites/vendas"
        element={protegida(<Sites />)}
      />
      <Route
        path="/sites/formularios"
        element={protegida(<Sites />)}
      />
      <Route
        path="/sites/dominios"
        element={protegida(<Sites />)}
      />

      {/* CAMPANHAS */}
      <Route
        path="/campanhas"
        element={protegida(<Campanhas />)}
      />
      <Route
        path="/campanhas/publicos"
        element={protegida(<Campanhas />)}
      />
      <Route
        path="/campanhas/remarketing"
        element={protegida(<Campanhas />)}
      />
      <Route
        path="/campanhas/resultados"
        element={protegida(<Campanhas />)}
      />

      {/* AUTOMAÇÕES */}
      <Route
        path="/automacoes"
        element={protegida(<Automacoes />)}
      />
      <Route
        path="/automacoes/remarketing"
        element={protegida(<Automacoes />)}
      />
      <Route
        path="/automacoes/carrinho-abandonado"
        element={protegida(<Automacoes />)}
      />
      <Route
        path="/automacoes/checkout-abandonado"
        element={protegida(<Automacoes />)}
      />
      <Route
        path="/automacoes/pos-venda"
        element={protegida(<Automacoes />)}
      />
      <Route
        path="/automacoes/reativacao"
        element={protegida(<Automacoes />)}
      />

      {/* ANALYTICS */}
      <Route
        path="/analytics"
        element={protegida(<Analytics />)}
      />

      {/* SUPORTE */}
      <Route
        path="/suporte"
        element={protegida(<Suporte />)}
      />

      {/* DEFINIÇÕES */}
      <Route
        path="/definicoes"
        element={protegida(<Definicoes />)}
      />
      <Route
        path="/definicoes/negocio"
        element={protegida(<Definicoes />)}
      />
      <Route
        path="/definicoes/agente"
        element={protegida(<Definicoes />)}
      />
      <Route
        path="/definicoes/canais"
        element={protegida(<Definicoes />)}
      />
      <Route
        path="/definicoes/meta"
        element={protegida(<Definicoes />)}
      />
      <Route
        path="/definicoes/pagamentos"
        element={protegida(<Definicoes />)}
      />
      <Route
        path="/definicoes/entregas"
        element={protegida(<Definicoes />)}
      />
      <Route
        path="/definicoes/automacoes"
        element={protegida(<Definicoes />)}
      />
      <Route
        path="/definicoes/seguranca"
        element={protegida(<Definicoes />)}
      />

      {/* NÚMEROS */}
      <Route
        path="/numeros"
        element={protegida(<Numeros />)}
      />

      {/* QUALQUER ROTA DESCONHECIDA */}
      <Route
        path="*"
        element={<Navigate to="/painel" replace />}
      />
    </Routes>
  );
}
