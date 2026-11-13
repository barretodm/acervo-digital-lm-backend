import { db } from "../config/db.js";

const SELECT_OBRA = `
  SELECT obra.id, obra.titulo, obra.tipo, obra.artista, obra.tecnica,
         obra.ano, obra.largura_cm, obra.altura_cm, obra.profundidade_cm,
         obra.descricao, obra.valor, obra.status, obra.ativa,
         obra.criado_em, obra.atualizado_em,
         COALESCE(
           json_agg(tecnica.nome ORDER BY tecnica.nome)
             FILTER (WHERE tecnica.id IS NOT NULL),
           '[]'::json
         ) AS tecnicas
  FROM obras AS obra
  LEFT JOIN obra_tecnicas AS relacao ON relacao.obra_id = obra.id
  LEFT JOIN tecnicas AS tecnica ON tecnica.id = relacao.tecnica_id
`;

export async function listarObras({ tipo, tecnica } = {}) {
  // RF02: vitrine publica, so obras ativas, com filtro opcional de tipo/tecnica.
  const condicoes = ["obra.ativa = true"];
  const valores = [];

  if (tipo) {
    valores.push(tipo);
    condicoes.push(`obra.tipo = $${valores.length}`);
  }
  if (tecnica) {
    valores.push(tecnica);
    condicoes.push(`obra.tecnica = $${valores.length}`);
  }

  const { rows } = await db.query(
    `${SELECT_OBRA} WHERE ${condicoes.join(" AND ")} GROUP BY obra.id ORDER BY obra.criado_em DESC`,
    valores,
  );
  return rows;
}

export async function buscarObraPorId(id, queryable = db) {
  const { rows } = await queryable.query(`${SELECT_OBRA} WHERE obra.id = $1 GROUP BY obra.id`, [
    id,
  ]);
  return rows[0];
}

export async function listarHistorico() {
  // RF14: so obras inativas, com a contagem de interesses recebidos.
  // Subquery em vez de JOIN com interesses pra nao inflar as linhas
  // quando a obra tem mais de uma tecnica E mais de um interesse.
  const { rows } = await db.query(`
    SELECT obra.id, obra.titulo, obra.tipo, obra.artista, obra.tecnica,
           obra.ano, obra.largura_cm, obra.altura_cm, obra.profundidade_cm,
           obra.descricao, obra.valor, obra.status, obra.ativa,
           obra.criado_em, obra.atualizado_em,
           COALESCE(
             json_agg(tecnica.nome ORDER BY tecnica.nome)
               FILTER (WHERE tecnica.id IS NOT NULL),
             '[]'::json
           ) AS tecnicas,
           (
             SELECT COUNT(*)::int FROM interesses WHERE interesses.obra_id = obra.id
           ) AS total_interesses
    FROM obras AS obra
    LEFT JOIN obra_tecnicas AS relacao ON relacao.obra_id = obra.id
    LEFT JOIN tecnicas AS tecnica ON tecnica.id = relacao.tecnica_id
    WHERE obra.ativa = false
    GROUP BY obra.id
    ORDER BY obra.atualizado_em DESC
  `);
  return rows;
}

async function salvarTecnicas(client, obraId, nomes) {
  await client.query("DELETE FROM obra_tecnicas WHERE obra_id = $1", [obraId]);

  for (const nome of nomes) {
    const { rows } = await client.query(
      `INSERT INTO tecnicas (nome)
       VALUES ($1)
       ON CONFLICT (nome) DO NOTHING
       RETURNING id`,
      [nome],
    );
    const tecnicaId =
      rows[0]?.id ??
      (await client.query("SELECT id FROM tecnicas WHERE nome = $1", [nome])).rows[0].id;
    await client.query("INSERT INTO obra_tecnicas (obra_id, tecnica_id) VALUES ($1, $2)", [
      obraId,
      tecnicaId,
    ]);
  }
}

export async function criarObra(dados, tecnicas) {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query(
      `INSERT INTO obras
         (titulo, tipo, artista, tecnica, ano, largura_cm, altura_cm,
          profundidade_cm, descricao, valor)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [
        dados.titulo ?? null,
        dados.tipo,
        dados.artista,
        dados.tecnica,
        dados.ano,
        dados.largura_cm,
        dados.altura_cm,
        dados.profundidade_cm,
        dados.descricao ?? null,
        dados.valor ?? null,
      ],
    );
    await salvarTecnicas(client, rows[0].id, tecnicas);
    const obra = await buscarObraPorId(rows[0].id, client);
    await client.query("COMMIT");
    return obra;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function atualizarObra(id, dados, tecnicas) {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query(
      `UPDATE obras
       SET titulo = $1, tipo = $2, artista = $3, tecnica = $4, ano = $5,
           largura_cm = $6, altura_cm = $7, profundidade_cm = $8,
           descricao = $9, valor = $10
       WHERE id = $11
       RETURNING id`,
      [
        dados.titulo ?? null,
        dados.tipo,
        dados.artista,
        dados.tecnica,
        dados.ano,
        dados.largura_cm,
        dados.altura_cm,
        dados.profundidade_cm,
        dados.descricao ?? null,
        dados.valor ?? null,
        id,
      ],
    );
    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return null;
    }
    await salvarTecnicas(client, id, tecnicas);
    const obra = await buscarObraPorId(id, client);
    await client.query("COMMIT");
    return obra;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function atualizarStatusObra(id, status) {
  // RF11/RF13: ao marcar como "vendido", a obra sai do acervo ativo e vai
  // pro historico automaticamente. Pra qualquer outro status, "ativa" nao e
  // tocado (nao forca a obra a voltar pro acervo ativo por aqui -- isso e
  // papel da reativacao, RF15).
  const { rows } = await db.query(
    `UPDATE obras
     SET status = $1, ativa = CASE WHEN $1 = 'vendido' THEN false ELSE ativa END
     WHERE id = $2
     RETURNING id`,
    [status, id],
  );
  if (rows.length === 0) return null;
  return buscarObraPorId(id);
}

export async function reativarObra(id) {
  // RF15: reativar sempre volta pro status "aberto", independente de onde
  // a obra estava antes de ser desativada.
  const { rows } = await db.query(
    "UPDATE obras SET status = 'aberto', ativa = true WHERE id = $1 RETURNING id",
    [id],
  );
  if (rows.length === 0) return null;
  return buscarObraPorId(id);
}

export async function excluirObra(id) {
  const { rows } = await db.query("DELETE FROM obras WHERE id = $1 RETURNING id", [id]);
  return rows[0] ?? null;
}
