import { randomUUID } from "node:crypto";
import { db } from "../config/db.js";
import { enviarFoto, removerFoto } from "../services/storage.js";
import { EXTENSOES_IMAGEM } from "../constants/imagem.js";

export async function adicionarFoto(obraId, arquivo, capa) {
  const { rows: obraExiste } = await db.query("SELECT 1 FROM obras WHERE id = $1", [obraId]);
  if (obraExiste.length === 0) return null;

  const id = randomUUID();
  const caminho = `${obraId}/${id}${EXTENSOES_IMAGEM[arquivo.mimetype]}`;
  const url = await enviarFoto(caminho, arquivo);

  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const { rows: existentes } = await client.query(
      "SELECT COUNT(*)::int AS total FROM fotos_obra WHERE obra_id = $1",
      [obraId],
    );
    const ehPrimeiraFoto = existentes[0].total === 0;
    const ehCapa = ehPrimeiraFoto || Boolean(capa);

    if (ehCapa) {
      await client.query("UPDATE fotos_obra SET capa = false WHERE obra_id = $1", [obraId]);
    }

    const { rows } = await client.query(
      `INSERT INTO fotos_obra (id, obra_id, url, capa, ordem)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id, obraId, url, ehCapa, existentes[0].total],
    );
    await client.query("COMMIT");
    return rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function removerFotoDaObra(fotoId) {
  const { rows } = await db.query("SELECT * FROM fotos_obra WHERE id = $1", [fotoId]);
  const foto = rows[0];
  if (!foto) return null;

  await db.query("DELETE FROM fotos_obra WHERE id = $1", [fotoId]);
  await removerFoto(foto.url);

  if (foto.capa) {
    const { rows: restantes } = await db.query(
      "SELECT id FROM fotos_obra WHERE obra_id = $1 ORDER BY ordem LIMIT 1",
      [foto.obra_id],
    );
    if (restantes[0]) {
      await db.query("UPDATE fotos_obra SET capa = true WHERE id = $1", [restantes[0].id]);
    }
  }

  return foto;
}

export async function listarFotosDaObra(obraId) {
  const { rows } = await db.query("SELECT * FROM fotos_obra WHERE obra_id = $1 ORDER BY ordem", [
    obraId,
  ]);
  return rows;
}
