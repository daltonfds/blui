import { supabase } from '../config/supabase.js';

// Motor de conversa baseado em regras + script de treino do produto.
// Para respostas mais avançadas (geradas por LLM), substituir o corpo
// desta função por uma chamada à API da Anthropic/OpenAI, passando
// o histórico de mensagens do contacto (memória) como contexto.
export async function responderMensagem({ contacto, texto }) {
  const { data: produto } = await supabase
    .from('produtos')
    .select('*')
    .eq('user_id', contacto.user_id)
    .eq('ativo', true)
    .limit(1)
    .maybeSingle();

  if (!produto) {
    return 'Olá! Em breve um dos nossos consultores vai continuar esta conversa. 🙌';
  }

  const textoLower = texto.toLowerCase();

  if (/pre[cç]o|quanto custa|valor/.test(textoLower)) {
    return `O ${produto.nome_produto} tem entrega ${produto.forma_entrega === 'cash_on_delivery' ? 'com pagamento na entrega (cash on delivery)' : produto.forma_pagamento}. Quer que eu confirme o teu pedido?`;
  }

  if (/entrega|demora|prazo/.test(textoLower)) {
    return `A entrega é feita via ${produto.forma_entrega === 'cash_on_delivery' ? 'pagamento na entrega (cash on delivery)' : produto.forma_pagamento}. Em que cidade estás?`;
  }

  if (/sim|quero|confirmo|ok/.test(textoLower)) {
    return `Perfeito! Para confirmar o teu pedido de ${produto.nome_produto}, preciso do teu nome completo e localização. 📦`;
  }

  return produto.script_abertura || `Olá! Obrigado por escreveres. Sobre o que gostarias de saber sobre o ${produto.nome_produto}?`;
}
