import { supabase } from '../config/supabase.js';

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ erro: 'Sessão não encontrada.' });
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({ erro: 'Sessão inválida ou expirada.' });
    }

    req.user = data.user;
    next();
  } catch (err) {
    res.status(401).json({ erro: 'Não foi possível validar a sessão.' });
  }
}
