import { supabase } from "../config/supabase.js";

export async function autenticar(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ error: "Faça login para continuar." });
  }

  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      return res.status(401).json({ error: "Sessão inválida ou expirada." });
    }
    next();
  } catch (error) {
    console.error("Erro ao verificar sessão do Supabase:", error);
    res.status(500).json({ error: "Erro ao verificar sessão." });
  }
}
