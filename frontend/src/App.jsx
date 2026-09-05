import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import Autenticacao from './pages/Autenticacao.jsx';
import Painel from './pages/Painel.jsx';
import Contactos from './pages/Contactos.jsx';
import Produtos from './pages/Produtos.jsx';
import Campanhas from './pages/Campanhas.jsx';
import Definicoes from './pages/Definicoes.jsx';
import RotaProtegida from './components/RotaProtegida.jsx';

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
    </Routes>
  );
}
