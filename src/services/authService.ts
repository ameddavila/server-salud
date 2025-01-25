import jwt from "jsonwebtoken";
import logger from "../utils/logger";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
const JWT_EXPIRATION = "1h"; // Token expira en 1 hora

// Generar un JWT
export const generateToken = (payload: object): string => {
  try {
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
    logger.info("Token JWT generado exitosamente");
    return token;
  } catch (error) {
    logger.error(
      `Error al generar el token JWT: ${
        error instanceof Error ? error.message : error
      }`
    );
    throw new Error("Error al generar el token JWT");
  }
};
