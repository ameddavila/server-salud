import { Router } from "express";
import { validateApiKey } from "../middlewares/validateApiKey";
import { generateToken } from "../services/authService";

const router = Router();

// Ruta para obtener un JWT después de validar el API Key
router.post("/login", validateApiKey, (req, res) => {
  const { codestablecimiento } = req.body;

  if (!codestablecimiento) {
    res.status(400).json({ message: "El codestablecimiento es obligatorio" });
    return;
  }

  // Generar un token JWT con el código del establecimiento
  const token = generateToken({ codestablecimiento });
  res.status(200).json({ message: "Token generado", token });
});

export default router;
