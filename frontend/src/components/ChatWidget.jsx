import React, { useState } from 'react';
import { api } from '../lib/api.js';

export default function ChatWidget() {
  const [aberto, setAberto] = useState(false);
  const [ticketId, setTicketId] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [texto, setTexto] = useState('');
  const [aEnviar, setAEnviar] = useState(false);
  const [contactosSuporte, setContactosSuporte] = useState(null);

  async function enviar() {
    if (!texto.trim()) return;
    const minhaMensagem = texto;
    setTexto('');
    setMensagens((prev) => [...prev, { remetente_tipo: 'user', conteudo: minhaMensagem }]);
    setAEnviar(true);

    try {
      if (!ticketId) {
        const resultado = await api.post('/api/suporte/ticket', { mensagem: minhaMensagem });
        setTicketId(resultado.ticket.id);
        setMensagens((prev) => [...prev, { remetente_tipo: 'bot', conteudo: resultado.respostaBot }]);
        if (resultado.contactosSuporte) setContactosSuporte(resultado.contactosSuporte);
      } else {
        const resultado = await api.post(`/api/suporte/ticket/${ticketId}/mensagem`, { mensagem: minhaMensagem });
        setMensagens((prev) => [...prev, { remetente_tipo: 'bot', conteudo: resultado.respostaBot }]);
        if (resultado.contactosSuporte) setContactosSuporte(resultado.contactosSuporte);
      }
    } catch (e) {
      setMensagens((prev) => [...prev, { remetente_tipo: 'bot', conteudo: 'Erro ao contactar o suporte. Tenta de novo.' }]);
    } finally {
      setAEnviar(false);
    }
  }

  async function pedirHumano() {
    if (!ticketId) return;
    const resultado = await api.post(`/api/suporte/ticket/${ticketId}/pedir-humano`, {});
    setContactosSuporte(resultado.contactosSuporte);
    setMensagens((prev) => [...prev, { remetente_tipo: 'bot', conteudo: 'A encaminhar para um atendente humano...' }]);
  }

  if (!aberto) {
    return (
      <button
        onClick={() => setAberto(true)}
        className="fixed bottom-5 right-5 bg-brand-500 text-base-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-brand-600 transition-colors z-50"
      >
        💬
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 w-80 max-w-[90vw] bg-base-white border border-black/10 rounded-xs shadow-2xl flex flex-col z-50" style={{ height: 420 }}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-black/5">
        <span className="text-sm font-medium text-base-ink">Suporte BLUI</span>
        <button onClick={() => setAberto(false)} className="text-base-ink/40 hover:text-base-ink">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {mensagens.length === 0 && (
          <p className="text-xs text-base-ink/40">Escreve a tua dúvida — preço, WhatsApp, campanhas, números...</p>
        )}
        {mensagens.map((m, i) => (
          <div key={i} className={`text-sm px-3 py-2 rounded-xs max-w-[85%] ${m.remetente_tipo === 'user' ? 'bg-brand-50 text-brand-700 ml-auto' : 'bg-base-fog text-base-ink'}`}>
            {m.conteudo}
          </div>
        ))}

        {contactosSuporte && (
          <div className="text-xs bg-base-fog rounded-xs p-3 space-y-1">
            <p className="font-medium text-base-ink">Fala diretamente connosco:</p>
            <a href={`mailto:${contactosSuporte.email}`} className="block text-brand-600 underline">✉️ {contactosSuporte.email}</a>
            <a href={`https://wa.me/${contactosSuporte.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="block text-brand-600 underline">📞 {contactosSuporte.whatsapp}</a>
          </div>
        )}

        {ticketId && !contactosSuporte && (
          <button onClick={pedirHumano} className="text-xs text-signal-red underline">Falar com atendente humano</button>
        )}
      </div>

      <div className="flex border-t border-black/5 p-2 gap-2">
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && enviar()}
          placeholder="Escreve aqui..."
          className="flex-1 text-sm border border-black/10 rounded-xs px-3 py-2 focus:border-brand-500 transition-colors"
        />
        <button onClick={enviar} disabled={aEnviar} className="bg-brand-500 text-base-white text-sm px-3 rounded-xs disabled:opacity-50">
          ➤
        </button>
      </div>
    </div>
  );
}
