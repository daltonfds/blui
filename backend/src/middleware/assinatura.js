import { supabase } from '../config/supabase.js';

// Bloqueia o acesso quando a assinatura não está ativa ou já venceu.
// Administradores (tabela admin_users) nunca são bloqueados por isto.
export async function verificarAssinatura(req, res, next) {
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

    const { data: admin } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', req.user.id)
      .eq('ativo', true)
      .maybeSingle();

    if (admin) return next();

    const { data: assinatura, error: erroAssinatura } = await supabase
      .from('assinaturas')
      .select('estado, ciclo_fim, planos(nome)')
      .eq('user_id', req.user.id)
      .order('criado_em', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (erroAssinatura) throw erroAssinatura;

    if (!assinatura) {
      return res.status(402).json({
        erro: 'sem_assinatura',
        mensagem: 'Ainda não tens nenhum plano ativo. Escolhe um plano para continuar.',
      });
    }

    const venceu = new Date(assinatura.ciclo_fim) < new Date();
    const bloqueada = assinatura.estado !== 'ativa' || venceu;

    if (bloqueada) {
      return res.status(402).json({
        erro: 'assinatura_expirada',
        mensagem: `O teu plano ${assinatura.planos?.nome || ''} expirou. Renova para continuar a usar a BLUI.`,
        ciclo_fim: assinatura.ciclo_fim,
      });
    }

    next();
  } catch (err) {
    console.error('verificarAssinatura:', err);
    res.status(500).json({ erro: 'Não foi possível verificar a assinatura.' });
  }
}
