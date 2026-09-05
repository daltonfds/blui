import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import Wordmark from '../components/Wordmark.jsx';

export default function Autenticacao({ abaInicial = 'entrar' }) {
  const [aba, setAba] = useState(abaInicial);
  const { entrar, registar } = useAuth();
  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');
  const [carregando, setCarregando] = useState(false);

  function limparMensagens() {
    setErro('');
    setAviso('');
  }

  async function submeter(e) {
    e.preventDefault();
    limparMensagens();

    if (aba === 'registar') {
      if (senha.length < 6) {
        return setErro('A senha precisa de pelo menos 6 caracteres.');
      }
      if (senha !== confirmarSenha) {
        return setErro('As senhas não coincidem.');
      }
    }

    setCarregando(true);
    try {
      if (aba === 'entrar') {
        await entrar(email, senha);
        navigate('/painel');
      } else {
        await registar(email, senha, nome);
        setAviso('Conta criada. Verifica o teu e-mail para confirmar o registo.');
        setAba('entrar');
      }
    } catch (err) {
      setErro(traduzirErro(err.message));
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen bg-base-fog flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-sm"
      >
        <div className="flex justify-center mb-8">
          <Link to="/"><Wordmark tamanho="text-2xl" /></Link>
        </div>

        <div className="bg-base-white border border-black/5 rounded-xs shadow-card p-7">
          <div className="grid grid-cols-2 gap-1 bg-base-fog rounded-xs p-1 mb-6">
            {[
              { id: 'entrar', label: 'Entrar' },
              { id: 'registar', label: 'Criar conta' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => { setAba(item.id); limparMensagens(); }}
                className={`text-sm font-medium py-2 rounded-xs transition-colors ${
                  aba === item.id ? 'bg-base-white text-base-ink shadow-card' : 'text-base-ink/50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <form onSubmit={submeter} className="space-y-4">
            {aba === 'registar' && (
              <Campo label="Nome">
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="O teu nome"
                  className={estiloInput}
                />
              </Campo>
            )}

            <Campo label="E-mail">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@empresa.com"
                className={estiloInput}
              />
            </Campo>

            <Campo label="Senha">
              <input
                type="password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                className={estiloInput}
              />
            </Campo>

            {aba === 'registar' && (
              <Campo label="Confirmar senha">
                <input
                  type="password"
                  required
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  placeholder="••••••••"
                  className={estiloInput}
                />
              </Campo>
            )}

            {erro && <p className="text-sm text-signal-red">{erro}</p>}
            {aviso && <p className="text-sm text-brand-600">{aviso}</p>}

            <button
              type="submit"
              disabled={carregando}
              className="w-full bg-base-ink text-base-white text-sm font-medium py-3 rounded-xs hover:bg-brand-900 transition-colors disabled:opacity-50"
            >
              {carregando ? 'A processar…' : aba === 'entrar' ? 'Entrar' : 'Criar conta'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-base-ink/40 mt-6">
          <Link to="/" className="hover:text-base-ink/70">Voltar ao início</Link>
        </p>
      </motion.div>
    </div>
  );
}

function Campo({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-base-ink/60">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

const estiloInput =
  'w-full border border-black/10 rounded-xs px-3.5 py-2.5 text-sm text-base-ink placeholder:text-base-ink/30 focus:border-brand-500 transition-colors';

function traduzirErro(mensagem) {
  if (/invalid login credentials/i.test(mensagem)) return 'E-mail ou senha incorretos.';
  if (/user already registered/i.test(mensagem)) return 'Já existe uma conta com este e-mail.';
  return mensagem;
}
