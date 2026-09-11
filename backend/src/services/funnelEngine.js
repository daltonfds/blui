import { supabase } from '../config/supabase.js';

export async function evaluateFunnel({ userId, contactoId, funnelId, text = '', eventType = 'message' }) {
  const { data: rules } = await supabase
    .from('funnel_rules')
    .select('*')
    .eq('funnel_id', funnelId)
    .eq('user_id', userId)
    .eq('ativo', true)
    .order('prioridade', { ascending: false });

  const matched = [];
  for (const rule of rules || []) {
    const condition = String(rule.condicao || '').toLowerCase();
    if (!condition || text.toLowerCase().includes(condition) || eventType === condition) {
      matched.push(rule);
      if (rule.to_stage_id) {
        await supabase.from('contact_funnel_stage').upsert({
          contacto_id: contactoId,
          funnel_id: funnelId,
          stage_id: rule.to_stage_id,
          user_id: userId,
          atualizado_em: new Date().toISOString(),
        }, { onConflict: 'contacto_id,funnel_id' });
      }
      break;
    }
  }
  return matched;
}
