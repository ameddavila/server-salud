import { Request, Response } from "express";
import sql from "../config/database";
import jwt from "jsonwebtoken";
import logger from "../utils/logger";
import { ServicioSiaf } from "../types/serviciosiaf"; // Asegúrate de tener este tipo definido

export const receiveServiciosSiaf = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.split(" ")[1];

    if (!token) {
      logger.warn("Token JWT no proporcionado.");
      res.status(401).json({ message: "Token requerido" });
      return;
    }

    const secret = process.env.JWT_SECRET || "your_jwt_secret";
    let codestablecimiento: string;

    try {
      const decoded = jwt.verify(token, secret) as { codestablecimiento: string };
      codestablecimiento = decoded.codestablecimiento;
      logger.info(`✅ JWT válido. CodEstablecimiento: ${codestablecimiento}`);
    } catch (error) {
      logger.error("❌ Token inválido:", error);
      res.status(403).json({ message: "Token inválido o expirado" });
      return;
    }

    const {
      loteNumero,
      totalLotes,
      totalDatos,
      datos,
    }: {
      loteNumero: number;
      totalLotes: number;
      totalDatos: number;
      datos: ServicioSiaf[];
    } = req.body;

    if (!Array.isArray(datos) || datos.length === 0) {
      logger.warn("❌ Datos de servicios SIAF inválidos.");
      res.status(400).json({
        message: "Formato de datos inválido. Se esperaba un arreglo no vacío.",
      });
      return;
    }

    if (loteNumero === 1) {
      logger.info(`🗑️ Eliminando registros previos de servicios SIAF para ${codestablecimiento}...`);
      try {
        await sql`
          DELETE FROM serviciossiaf WHERE codestablecimiento = ${codestablecimiento}
        `;
        logger.info(`✅ Registros antiguos eliminados.`);
      } catch (error) {
        logger.error("❌ Error al eliminar registros existentes:", error);
        res.status(500).json({
          message: "Error al limpiar registros anteriores.",
          error,
        });
        return;
      }
    }

    logger.info(`📦 Insertando lote ${loteNumero}/${totalLotes} de ${totalDatos} registros.`);

    try {
      await sql`BEGIN;`;

      for (const row of datos) {
        await sql`
          INSERT INTO serviciossiaf (
            id, codestablecimiento, vsersigla, cocdescri, fu_codigo, nombre,
            vrececha, id_mes, anio, cantidad, costo, vdetpreuni, vclihiccli,
            tipo, vsercodigo, vgrucodigo, vserdescri
          ) VALUES (
            gen_random_uuid(), ${codestablecimiento}, ${row.vsersigla}, ${row.cocdescri},
            ${row.fu_codigo}, ${row.nombre}, ${row.vrececha}, ${row.id_mes}, ${row.anio},
            ${row.cantidad}, ${row.costo}, ${row.vdetpreuni}, ${row.vclihiccli},
            ${row.tipo}, ${row.vsercodigo}, ${row.vgrucodigo}, ${row.vserdescri}
          )
        `;
      }

      await sql`COMMIT;`;
      logger.info(`✅ Lote ${loteNumero} de servicios SIAF procesado con éxito.`);
      res.status(200).json({ message: `Lote ${loteNumero} procesado con éxito.` });
    } catch (error) {
      await sql`ROLLBACK;`;
      logger.error("❌ Error al insertar datos de servicios SIAF:", error);
      res.status(500).json({
        message: "Error al insertar datos en la base de datos.",
        error,
      });
    }
  } catch (error) {
    logger.error("❌ Error general en servicios SIAF:", error);
    res.status(500).json({ message: "Error interno del servidor.", error });
  }
};
