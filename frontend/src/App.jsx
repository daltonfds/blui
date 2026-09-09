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
import Assinatura from './pages/Assinatura.jsx';
import Suporte from './pages/Suporte.jsx';
import WhatsApp from './pages/WhatsApp.jsx';
import Admin from './pages/Admin.jsx';

import Analytics from './pages/Analytics.jsx';
import Automacoes from './pages/Automacoes.jsx';
import Conversas from './pages/Conversas.jsx';
import Loja from './pages/Loja.jsx';
import Sites from './pages/Sites.jsx';

import RotaProtegida from './components/RotaProtegida.jsx';

function Protegida({ children, ignorarAssinatura = false }) {
  return (
    <RotaProtegida ignorarAssinatura={ignorarAssinatura}>
      {children}
    </RotaProtegida>
  );
}

export default function App() {
  return (
    <Routes>

      {/* PUBLICO */}
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
      <Route path="/painel" element={<Protegida><Painel /></Protegida>} />
      <Route path="/painel/funil" element={<Protegida><Painel /></Protegida>} />
      <Route path="/painel/receita" element={<Protegida><Painel /></Protegida>} />
      <Route path="/painel/oportunidades" element={<Protegida><Painel /></Protegida>} />
      <Route path="/analytics" element={<Protegida><Analytics /></Protegida>} />

      {/* CONTACTOS */}
      <Route path="/contactos" element={<Protegida><Contactos /></Protegida>} />
      <Route path="/contactos/leads" element={<Protegida><Contactos /></Protegida>} />
      <Route path="/contactos/clientes" element={<Protegida><Contactos /></Protegida>} />
      <Route path="/contactos/segmentos" element={<Protegida><Contactos /></Protegida>} />
      <Route path="/contactos/etiquetas" element={<Protegida><Contactos /></Protegida>} />

      {/* CONVERSAS */}
      <Route path="/conversas" element={<Protegida><Conversas /></Protegida>} />
      <Route path="/conversas/whatsapp" element={<Protegida><Conversas /></Protegida>} />
      <Route path="/conversas/instagram" element={<Protegida><Conversas /></Protegida>} />
      <Route path="/conversas/messenger" element={<Protegida><Conversas /></Protegida>} />
      <Route path="/conversas/site" element={<Protegida><Conversas /></Protegida>} />

      {/* PRODUTOS */}
      <Route path="/produtos" element={<Protegida><Produtos /></Protegida>} />
      <Route path="/produtos/categorias" element={<Protegida><Produtos /></Protegida>} />
      <Route path="/produtos/faq" element={<Protegida><Produtos /></Protegida>} />
      <Route path="/produtos/agente" element={<Protegida><Produtos /></Protegida>} />

      {/* LOJA */}
      <Route path="/loja" element={<Protegida><Loja /></Protegida>} />
      <Route path="/loja/produtos" element={<Protegida><Loja /></Protegida>} />
      <Route path="/loja/pedidos" element={<Protegida><Loja /></Protegida>} />
      <Route path="/loja/carrinhos" element={<Protegida><Loja /></Protegida>} />
      <Route path="/loja/checkout" element={<Protegida><Loja /></Protegida>} />

      {/* SITES */}
      <Route path="/sites" element={<Protegida><Sites /></Protegida>} />
      <Route path="/sites/paginas-venda" element={<Protegida><Sites /></Protegida>} />
      <Route path="/sites/formularios" element={<Protegida><Sites /></Protegida>} />
      <Route path="/sites/dominios" element={<Protegida><Sites /></Protegida>} />

      {/* CAMPANHAS */}
      <Route path="/campanhas" element={<Protegida><Campanhas /></Protegida>} />
      <Route path="/campanhas/publicos" element={<Protegida><Campanhas /></Protegida>} />
      <Route path="/campanhas/remarketing" element={<Protegida><Campanhas /></Protegida>} />
      <Route path="/campanhas/resultados" element={<Protegida><Campanhas /></Protegida>} />

      {/* AUTOMAÇÕES */}
      <Route path="/automacoes" element={<Protegida><Automacoes /></Protegida>} />
      <Route path="/automacoes/remarketing" element={<Protegida><Automacoes /></Protegida>} />
      <Route
        path="/automacoes/carrinho-abandonado"
        element={<Protegida><Automacoes /></Protegida>}
      />
      <Route
        path="/automacoes/checkout-abandonado"
        element={<Protegida><Automacoes /></Protegida>}
      />
      <Route path="/automacoes/pos-venda" element={<Protegida><Automacoes /></Protegida>} />
      <Route path="/automacoes/reativacao" element={<Protegida><Automacoes /></Protegida>} />

      {/* DEFINIÇÕES */}
      <Route path="/definicoes" element={<Protegida><Definicoes /></Protegida>} />
      <Route path="/definicoes/negocio" element={<Protegida><Definicoes /></Protegida>} />
      <Route path="/definicoes/agente" element={<Protegida><Definicoes /></Protegida>} />
      <Route path="/definicoes/canais" element={<Protegida><Definicoes /></Protegida>} />
      <Route path="/definicoes/whatsapp" element={<Protegida><WhatsApp /></Protegida>} />
      <Route path="/definicoes/meta" element={<Protegida><Definicoes /></Protegida>} />
      <Route path="/definicoes/pagamentos" element={<Protegida><Definicoes /></Protegida>} />
      <Route path="/definicoes/entregas" element={<Protegida><Definicoes /></Protegida>} />
      <Route path="/definicoes/automacoes" element={<Protegida><Definicoes /></Protegida>} />
      <Route path="/definicoes/seguranca" element={<Protegida><Definicoes /></Protegida>} />

      {/* CONTA */}
      <Route
        path="/assinatura"
        element={
          <RotaProtegida ignorarAssinatura>
            <Assinatura />
          </RotaProtegida>
        }
      />

      <Route
        path="/suporte"
        element={
          <RotaProtegida ignorarAssinatura>
            <Suporte />
          </RotaProtegida>
        }
      />

      {/* ADMIN */}
      <Route
        path="/admin"
        element={
          <RotaProtegida ignorarAssinatura>
            <Admin />
          </RotaProtegida>
        }
      />

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/painel" replace />} />

    </Routes>
  );
}
