import multer from "multer";
import { EXTENSOES_IMAGEM } from "../constants/imagem.js";

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter(_req, file, callback) {
    if (!EXTENSOES_IMAGEM[file.mimetype]) {
      return callback(new Error("Escolha uma imagem JPG, PNG ou WEBP."));
    }
    callback(null, true);
  },
  limits: { fileSize: 20 * 1024 * 1024 },
});

export function receberFoto(req, res, next) {
  upload.single("foto")(req, res, (error) => {
    if (!error) return next();
    const mensagem =
      error.code === "LIMIT_FILE_SIZE" ? "A imagem deve ter no máximo 20 MB." : error.message;
    res.status(400).json({ error: mensagem });
  });
}
