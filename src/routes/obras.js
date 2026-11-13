import { Router } from "express";
import { autenticar } from "../middlewares/auth.js";
import * as obrasController from "../controllers/obras.js";
import * as interessesController from "../controllers/interesses.js";

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
