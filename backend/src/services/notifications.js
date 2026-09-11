import { supabase } from '../config/supabase.js';

export async function createNotification(userId, type, title, message, data = {}) {
  const { data: row, error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      tipo: type,
      titulo: title,
      mensagem: message,
      dados: data,
    })
    .select()
    .single();

  if (error) throw error;
  return row;
}
