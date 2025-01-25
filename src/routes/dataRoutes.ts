import { Router } from "express";
import { validateToken } from "../middlewares/validateToken";
import { receiveData } from "../controllers/dataController";

const router = Router();

// Ruta protegida para recibir datos de medicamentos
router.post("/medicamentos", validateToken, receiveData);

export default router;
