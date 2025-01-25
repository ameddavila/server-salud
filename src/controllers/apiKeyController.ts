import { Request, Response } from "express";
import sql from "../config/database";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import logger from "../utils/logger"; // Importa el logger

// Solicitar una nueva API Key
export const requestApiKey = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { codestablecimiento } = req.body;

  if (!codestablecimiento) {
    logger.warn("Solicitud fallida: codestablecimiento es obligatorio");
    res.status(400).json({ message: "El codestablecimiento es obligatorio" });
    return;
  }

  try {
    // Verificar si el codestablecimiento existe en la tabla "establecimientos"
    const establecimiento = await sql`
      SELECT codestablecimiento FROM establecimientos WHERE codestablecimiento = ${codestablecimiento}
    `;

    if (establecimiento.length === 0) {
      logger.warn(
        `Solicitud fallida: codestablecimiento ${codestablecimiento} no encontrado`
      );
      res.status(404).json({
        message: "El codestablecimiento no existe en la base de datos",
      });
      return;
    }

    // Eliminar el API Key previo (si existe)
    const deletedKeys = await sql`
      DELETE FROM api_keys WHERE codestablecimiento = ${codestablecimiento}
      RETURNING api_key
    `;

    if (deletedKeys.length > 0) {
      logger.info(
        `API Key eliminado para codestablecimiento: ${codestablecimiento}, API Key eliminado: ${deletedKeys[0].api_key}`
      );
    }

    // Generar un nuevo API Key
    const apiKey = uuidv4();
    const hashedApiKey = crypto
      .createHash("sha256")
      .update(apiKey)
      .digest("hex");

    // Fecha de expiración (ejemplo: 30 días desde ahora)
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30);

    // Guardar el API Key en la base de datos
    await sql`
      INSERT INTO api_keys (codestablecimiento, api_key, fecha_expiracion, activo)
      VALUES (${codestablecimiento}, ${hashedApiKey}, ${expirationDate}, TRUE)
    `;

    logger.info(
      `API Key generado para codestablecimiento: ${codestablecimiento}`
    );
    res
      .status(201)
      .json({ message: "API Key generado", apiKey, expiresAt: expirationDate });
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Error desconocido al generar el API Key";

    logger.error(
      `Error al generar API Key para codestablecimiento ${codestablecimiento}: ${errorMessage}`
    );
    res.status(500).json({ message: "Error al generar el API Key" });
  }
};

// Renovar API Key
export const renewApiKey = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { codestablecimiento, currentApiKey } = req.body;

  if (!codestablecimiento || !currentApiKey) {
    logger.warn(
      "Solicitud de renovación fallida: codestablecimiento y currentApiKey son obligatorios"
    );
    res.status(400).json({
      message: "codestablecimiento y currentApiKey son obligatorios",
    });
    return;
  }

  try {
    const hashedApiKey = crypto
      .createHash("sha256")
      .update(currentApiKey)
      .digest("hex");

    const existingKey = await sql`
      SELECT * FROM api_keys
      WHERE codestablecimiento = ${codestablecimiento}
      AND api_key = ${hashedApiKey}
      AND activo = TRUE
      AND fecha_expiracion > CURRENT_TIMESTAMP
    `;

    if (existingKey.length === 0) {
      logger.warn(
        `Renovación fallida: API Key inválido o expirado para codestablecimiento ${codestablecimiento}`
      );
      res.status(400).json({ message: "API Key inválido o expirado" });
      return;
    }

    // Eliminar el API Key previo
    const deletedKeys = await sql`
      DELETE FROM api_keys WHERE codestablecimiento = ${codestablecimiento}
      AND api_key = ${hashedApiKey}
      RETURNING api_key
    `;

    if (deletedKeys.length > 0) {
      logger.info(
        `API Key eliminado para codestablecimiento: ${codestablecimiento}, API Key eliminado: ${deletedKeys[0].api_key}`
      );
    }

    // Generar un nuevo API Key
    const newApiKey = uuidv4();
    const newHashedApiKey = crypto
      .createHash("sha256")
      .update(newApiKey)
      .digest("hex");
    const newExpirationDate = new Date();
    newExpirationDate.setDate(newExpirationDate.getDate() + 30);

    // Insertar el nuevo API Key
    await sql`
      INSERT INTO api_keys (codestablecimiento, api_key, fecha_expiracion, activo)
      VALUES (${codestablecimiento}, ${newHashedApiKey}, ${newExpirationDate}, TRUE)
    `;

    logger.info(
      `API Key renovado para codestablecimiento: ${codestablecimiento}`
    );
    res.status(201).json({
      message: "API Key renovado",
      apiKey: newApiKey,
      expiresAt: newExpirationDate,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Error desconocido al renovar el API Key";

    logger.error(
      `Error al renovar API Key para codestablecimiento ${codestablecimiento}: ${errorMessage}`
    );
    res.status(500).json({ message: "Error al renovar el API Key" });
  }
};
