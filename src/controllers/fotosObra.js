import * as fotosObraRepository from "../repositories/fotosObra.js";

export async function adicionar(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: "Envie uma imagem no campo 'foto'." });
  }

  try {
    const foto = await fotosObraRepository.adicionarFoto(
      req.params.id,
      req.file,
      req.body.capa === "true",
    );
    if (!foto) return res.status(404).json({ error: "Obra não encontrada." });
    res.status(201).json(foto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao enviar a foto." });
  }
}

export async function remover(req, res) {
  try {
    const foto = await fotosObraRepository.removerFotoDaObra(req.params.fotoId);
    if (!foto) return res.status(404).json({ error: "Foto não encontrada." });
    res.json({ id: foto.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao remover a foto." });
  }
}
