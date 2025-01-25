import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import sql from "../config/database";
import logger from "../utils/logger";

export const validateApiKey = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const apiKey = req.headers["x-api-key"] as string;

  if (!apiKey) {
    logger.warn("Solicitud fallida: Falta el API Key en los headers");
    res.status(401).json({ message: "API Key requerida" });
    return;
  }

  try {
    // Hashear el API Key recibido para compararlo con el valor almacenado
    const hashedApiKey = crypto
      .createHash("sha256")
      .update(apiKey)
      .digest("hex");

    // Consultar en la base de datos
    const validKey = await sql`
      SELECT * FROM api_keys
      WHERE api_key = ${hashedApiKey}
      AND activo = TRUE
      AND fecha_expiracion > CURRENT_TIMESTAMP
    `;

    if (validKey.length === 0) {
      logger.warn("API Key inválido o expirado");
      res.status(401).json({ message: "API Key inválido o expirado" });
      return;
    }

    // Adjuntar el código del establecimiento al objeto `req` para uso posterior
    req.body.codestablecimiento = validKey[0].codestablecimiento;
    next();
  } catch (error) {
    logger.error(
      `Error al validar API Key: ${
        error instanceof Error ? error.message : error
      }`
    );
    res.status(500).json({ message: "Error al validar el API Key" });
  }
};
