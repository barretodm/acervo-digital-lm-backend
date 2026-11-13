import { Router } from "express";
import * as interessesController from "../controllers/interesses.js";

export const interessesRouter = Router();

interessesRouter.post("/", interessesController.criar);
