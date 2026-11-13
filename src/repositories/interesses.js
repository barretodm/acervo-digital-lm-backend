import { db } from "../config/db.js";

export async function listarInteressesPorObra(obraId) {
  const { rows } = await db.query(
    `SELECT id, obra_id, nome, email, telefone, mensagem, consentimento_lgpd, criado_em
     FROM interesses
     WHERE obra_id = $1
     ORDER BY criado_em DESC`,
    [obraId],
  );
  return rows;
}

export async function criarInteresse(dados) {
  const { rows } = await db.query(
    `INSERT INTO interesses (obra_id, nome, email, telefone, mensagem, consentimento_lgpd)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      dados.obra_id,
      dados.nome,
      dados.email,
      dados.telefone,
      dados.mensagem || null,
      dados.consentimento_lgpd,
    ],
  );
  return rows[0];
}
