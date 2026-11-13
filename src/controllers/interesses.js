import * as interessesRepository from "../repositories/interesses.js";
import { validarInteresse } from "../validators/interesses.js";

export async function listar(req, res) {
  try {
    const interesses = await interessesRepository.listarTodosInteresses();
    res.json(interesses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar interesses." });
  }
}

export async function listarPorObra(req, res) {
  try {
    const interesses = await interessesRepository.listarInteressesPorObra(req.params.id);
    res.json(interesses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar interesses." });
  }
}

export async function criar(req, res) {
  const erros = validarInteresse(req.body);
  if (erros.length > 0) return res.status(400).json({ error: erros.join(" ") });

  try {
    const interesse = await interessesRepository.criarInteresse(req.body);
    res.status(201).json(interesse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao cadastrar interesse." });
  }
}
