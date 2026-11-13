import * as obrasRepository from "../repositories/obras.js";
import { validarObra, validarStatus, separarTecnicas } from "../validators/obras.js";

function normalizarObra(body) {
  return {
    ...body,
    ano: Number(body.ano),
    largura_cm: Number(body.largura_cm),
    altura_cm: Number(body.altura_cm),
    profundidade_cm: body.tipo === "escultura" ? Number(body.profundidade_cm) : null,
  };
}

export async function listar(req, res) {
  try {
    const obras = await obrasRepository.listarObras();
    res.json(obras);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar obras." });
  }
}

export async function buscarPorId(req, res) {
  try {
    const obra = await obrasRepository.buscarObraPorId(req.params.id);
    if (!obra) return res.status(404).json({ error: "Obra não encontrada." });
    res.json(obra);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar obra." });
  }
}

export async function criar(req, res) {
  const erros = validarObra(req.body);
  if (erros.length > 0) return res.status(400).json({ error: erros.join(" ") });

  try {
    const dados = normalizarObra(req.body);
    const tecnicas = separarTecnicas(req.body.tecnicas);
    const obra = await obrasRepository.criarObra(dados, tecnicas);
    res.status(201).json(obra);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao cadastrar obra." });
  }
}

export async function atualizar(req, res) {
  const erros = validarObra(req.body);
  if (erros.length > 0) return res.status(400).json({ error: erros.join(" ") });

  try {
    const dados = normalizarObra(req.body);
    const tecnicas = separarTecnicas(req.body.tecnicas);
    const obra = await obrasRepository.atualizarObra(req.params.id, dados, tecnicas);
    if (!obra) return res.status(404).json({ error: "Obra não encontrada." });
    res.json(obra);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao atualizar obra." });
  }
}

export async function atualizarStatus(req, res) {
  const erros = validarStatus(req.body.status);
  if (erros.length > 0) return res.status(400).json({ error: erros.join(" ") });

  try {
    const obra = await obrasRepository.atualizarStatusObra(req.params.id, req.body.status);
    if (!obra) return res.status(404).json({ error: "Obra não encontrada." });
    res.json(obra);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao atualizar status da obra." });
  }
}
