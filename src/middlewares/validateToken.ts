import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import logger from "../utils/logger";

export const validateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    logger.warn("Token JWT no proporcionado.");
    res.status(401).json({ message: "Token requerido" });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET || "your_jwt_secret";
    const decoded = jwt.verify(token, secret) as { codestablecimiento: string };

    // Guardar el codestablecimiento del token en req.body
    req.body.establecimiento = {
      codeEstablecimiento: decoded.codestablecimiento,
    };

    logger.info(
      `Token JWT válido, codEstablecimiento autorizado: ${decoded.codestablecimiento}`
    );
    next();
  } catch (error: any) {
    logger.error("Token JWT inválido:", error.message);
    res.status(403).json({ message: "Token inválido o expirado" });
  }
};
