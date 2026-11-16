import { Router } from "express";
import { autenticar } from "../middlewares/auth.js";
import { receberFoto } from "../middlewares/upload.js";
import * as obrasController from "../controllers/obras.js";
import * as interessesController from "../controllers/interesses.js";
import * as fotosObraController from "../controllers/fotosObra.js";

export const obrasRouter = Router();

obrasRouter.get("/", obrasController.listar);
obrasRouter.get("/historico", autenticar, obrasController.listarHistorico);
obrasRouter.get("/:id", obrasController.buscarPorId);
obrasRouter.get("/:id/interesses", autenticar, interessesController.listarPorObra);
obrasRouter.post("/", autenticar, obrasController.criar);
obrasRouter.put("/:id", autenticar, obrasController.atualizar);
obrasRouter.patch("/:id/status", autenticar, obrasController.atualizarStatus);
obrasRouter.post("/:id/reativar", autenticar, obrasController.reativar);
obrasRouter.delete("/:id", autenticar, obrasController.excluir);
obrasRouter.post("/:id/fotos", autenticar, receberFoto, fotosObraController.adicionar);
obrasRouter.delete("/:id/fotos/:fotoId", autenticar, fotosObraController.remover);
