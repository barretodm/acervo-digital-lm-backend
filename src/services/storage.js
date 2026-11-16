import { supabase } from "../config/supabase.js";

const BUCKET = "fotos-obra";

export async function enviarFoto(caminho, arquivo) {
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(caminho, arquivo.buffer, { contentType: arquivo.mimetype });
  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(caminho);
  return publicUrl;
}

export async function removerFoto(url) {
  const caminho = extrairCaminho(url);
  if (!caminho) return;
  const { error } = await supabase.storage.from(BUCKET).remove([caminho]);
  if (error) console.error(`Erro ao remover foto do storage (${caminho}):`, error);
}

function extrairCaminho(url) {
  const marcador = `/${BUCKET}/`;
  const indice = url.indexOf(marcador);
  if (indice === -1) return null;
  return url.slice(indice + marcador.length);
}
