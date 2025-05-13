import { Router } from "express";
import { validateToken } from "../middlewares/validateToken";
import { receiveData } from "../controllers/dataController";
import { receiveServiciosSiaf } from "../controllers/receiveServiciosSiaf";


const router = Router();

// Medicamentos
router.post("/medicamentos", validateToken, receiveData);

// Servicios SIAF
router.post("/serviciossiaf", validateToken, receiveServiciosSiaf);

export default router;
