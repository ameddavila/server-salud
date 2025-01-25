import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import sql from "../config/database"; // Conexión a Neon

const secretKey = process.env.JWT_SECRET || "defaultSecretKey";

/**
 * Genera un JWT basado en una API Key válida.
 */
export const generateToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey) {
    res.status(401).json({ message: "API Key requerida" });
    return;
  }

  try {
    // Verificar si la API Key es válida
    const [key] = await sql`
            SELECT * FROM api_keys WHERE api_key = ${apiKey} AND status = true
        `;

    if (!key) {
      res.status(403).json({ message: "API Key inválida o desactivada" });
      return;
    }

    // Generar el token JWT
    const token = jwt.sign(
      { codeEstablecimiento: key.code_establecimiento }, // Información del cliente
      secretKey, // Clave secreta para firmar el token
      { expiresIn: "1h" } // Token válido por 1 hora
    );

    res.status(200).json({ token });
  } catch (error) {
    console.error("Error al generar el token:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
