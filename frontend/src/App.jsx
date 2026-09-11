import { Routes, Route, Navigate } from 'react-router-dom';

import Landing from './pages/Landing.jsx';
import Autenticacao from './pages/Autenticacao.jsx';
import Painel from './pages/Painel.jsx';
import Contactos from './pages/Contactos.jsx';
import Conversas from './pages/Conversas.jsx';
import Funil from './pages/Funil.jsx';
import Treino from './pages/Treino.jsx';
import Remarketing from './pages/Remarketing.jsx';
import Numeros from './pages/Numeros.jsx';
import Assinatura from './pages/Assinatura.jsx';
import Suporte from './pages/Suporte.jsx';
import Admin from './pages/Admin.jsx';
import WhatsApp from './pages/WhatsApp.jsx';
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
      <Route path="/" element={<Landing />} />
      <Route path="/entrar" element={<Autenticacao abaInicial="entrar" />} />
      <Route path="/registar" element={<Autenticacao abaInicial="registar" />} />

      <Route path="/painel" element={<Protegida><Painel /></Protegida>} />
      <Route path="/conversas" element={<Protegida><Conversas /></Protegida>} />
      <Route path="/contactos" element={<Protegida><Contactos /></Protegida>} />
      <Route path="/funil" element={<Protegida><Funil /></Protegida>} />
      <Route path="/treino" element={<Protegida><Treino /></Protegida>} />
      <Route path="/remarketing" element={<Protegida><Remarketing /></Protegida>} />
      <Route path="/numeros" element={<Protegida><Numeros /></Protegida>} />

      <Route path="/whatsapp" element={<Protegida><WhatsApp /></Protegida>} />
      <Route path="/assinatura" element={<RotaProtegida ignorarAssinatura><Assinatura /></RotaProtegida>} />
      <Route path="/suporte" element={<RotaProtegida ignorarAssinatura><Suporte /></RotaProtegida>} />

      <Route path="/admin" element={<RotaProtegida ignorarAssinatura><Admin /></RotaProtegida>} />

      <Route path="*" element={<Navigate to="/painel" replace />} />
    </Routes>
  );
}
