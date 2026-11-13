import { Router } from "express";
import { autenticar } from "../middlewares/auth.js";
import * as interessesController from "../controllers/interesses.js";

export const interessesRouter = Router();

interessesRouter.get("/", autenticar, interessesController.listar);
interessesRouter.post("/", interessesController.criar);
