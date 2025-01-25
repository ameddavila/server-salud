import { Router } from "express";
import { requestApiKey, renewApiKey } from "../controllers/apiKeyController";

const router = Router();

router.post("/request", requestApiKey); // Solicitar API Key
router.post("/renew", renewApiKey); // Renovar API Key

export default router;
