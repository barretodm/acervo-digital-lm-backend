import { Router } from "express";
import { autenticar } from "../middlewares/auth.js";
import * as obrasController from "../controllers/obras.js";

export const obrasRouter = Router();

obrasRouter.get("/", obrasController.listar);
obrasRouter.get("/:id", obrasController.buscarPorId);
obrasRouter.post("/", autenticar, obrasController.criar);
obrasRouter.put("/:id", autenticar, obrasController.atualizar);
obrasRouter.patch("/:id/status", autenticar, obrasController.atualizarStatus);
