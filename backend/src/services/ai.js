const AI_BASE_URL = process.env.AI_BASE_URL || 'https://api.openai.com/v1';
const AI_MODEL = process.env.AI_MODEL || 'gpt-4o-mini';

export async function aiJson({ system, user }) {
  if (!process.env.AI_API_KEY && !process.env.OPENAI_API_KEY) return null;
  const key = process.env.AI_API_KEY || process.env.OPENAI_API_KEY;

  const response = await fetch(`${AI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: AI_MODEL,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || 'Falha no motor de IA');

  const content = data?.choices?.[0]?.message?.content;
  if (!content) return null;
  return JSON.parse(content);
}

export function heuristicLeadScore(messages = []) {
  const text = messages.map(m => m.conteudo || '').join(' ').toLowerCase();
  let score = 20;
  const strong = ['comprar', 'quero', 'pedido', 'encomendar', 'onde pago', 'como pagar', 'preço', 'preco'];
  const medium = ['quanto', 'entrega', 'prazo', 'disponível', 'disponivel', 'tem stock', 'tem estoque'];
  const negative = ['não quero', 'nao quero', 'caro demais', 'spam', 'parar'];

  for (const word of strong) if (text.includes(word)) score += 12;
  for (const word of medium) if (text.includes(word)) score += 6;
  for (const word of negative) if (text.includes(word)) score -= 20;

  return Math.max(0, Math.min(100, score));
}

export function detectObjection(text = '') {
  const t = text.toLowerCase();
  if (/caro|preço|preco|desconto/.test(t)) return 'preço';
  if (/entrega|demora|prazo/.test(t)) return 'entrega';
  if (/confi|golpe|seguro|garantia/.test(t)) return 'confiança';
  if (/pagar|pagamento|mpesa|emola|cartão|cartao/.test(t)) return 'pagamento';
  return null;
}

export function detectSentiment(text = '') {
  const t = text.toLowerCase();
  if (/raiva|irritado|péssimo|pessimo|engan|golpe|não funciona|nao funciona/.test(t)) return 'negativo';
  if (/obrigado|obrigada|ótimo|otimo|gostei|perfeito|excelente/.test(t)) return 'positivo';
  return 'neutro';
}
