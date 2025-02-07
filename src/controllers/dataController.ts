import { Request, Response } from "express";
import sql from "../config/database"; // Configuración de la conexión con la base de datos
import jwt from "jsonwebtoken";
import { Medicamento } from "../types/medicamento";
import logger from "../utils/logger"; // Logger centralizado

const ajustarTipos = (datos: Medicamento[]): Medicamento[] => {
  return datos.map((dato) => ({
    ...dato,
    consumo_promedio1_5: Math.floor(dato.consumo_promedio1_5 || 0),
    consumo_promedio4_5: Math.floor(dato.consumo_promedio4_5 || 0),
  }));
};

export const receiveData = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Obtener el token JWT
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      logger.warn("Token JWT no proporcionado.");
      res.status(401).json({ message: "Token requerido" });
      return;
    }

    // Decodificar el token para obtener el codestablecimiento
    const secret = process.env.JWT_SECRET || "your_jwt_secret";
    let codestablecimiento: string;
    try {
      const decoded = jwt.verify(token, secret) as {
        codestablecimiento: string;
      };
      codestablecimiento = decoded.codestablecimiento;
      logger.info(`✅ JWT válido. CodEstablecimiento: ${codestablecimiento}`);
    } catch (error) {
      logger.error("❌ Error al decodificar el token JWT:", error);
      res.status(403).json({ message: "Token inválido o expirado" });
      return;
    }

    // Extraer los datos del cuerpo de la solicitud
    const {
      loteNumero,
      totalLotes,
      totalDatos,
      datos,
    }: {
      loteNumero: number;
      totalLotes: number;
      totalDatos: number;
      datos: Medicamento[];
    } = req.body;

    if (!Array.isArray(datos) || datos.length === 0) {
      logger.warn("❌ Datos enviados en un formato inválido.");
      res.status(400).json({
        message: "Formato de datos inválido. Se esperaba un arreglo no vacío.",
      });
      return;
    }

    // 🔴 Verificar y eliminar registros existentes
    if (loteNumero === 1) {
      logger.info(
        `🗑️ Eliminando registros existentes para ${codestablecimiento}...`
      );
      await sql`
        DELETE FROM medicamentos WHERE codestablecimiento = ${codestablecimiento}
      `;
      logger.info(
        `✅ Registros antiguos eliminados para ${codestablecimiento}.`
      );
    }

    // Log de los detalles del lote
    logger.info(`📦 Procesando lote recibido:`);
    logger.info(`🔹 Lote Número: ${loteNumero}`);
    logger.info(`🔹 Total Lotes: ${totalLotes}`);
    logger.info(`🔹 Total Datos: ${totalDatos}`);

    // Ajustar los tipos de datos antes de la inserción
    const datosAjustados = ajustarTipos(datos);

    // Insertar los datos
    logger.info(
      `📝 Insertando nuevos datos para el codEstablecimiento: ${codestablecimiento}`
    );
    await Promise.all(
      datosAjustados.map(async (dato) => {
        await sql`
          INSERT INTO medicamentos (
            codestablecimiento, gru_codigo, med_codigo, gru_descripcion,
            med_comercial, med_codificacion, med_unidad, med_concentracion,
            med_tipo, tipo_med, ant_entradas, ant_salidas, saldo_inicial,
            ant_entradas_costo, ant_salidas_costo, saldo_inicial_costo, entradas,
            salidas, saldo, entradas_costo, salidas_costo, costo, meses_activos,
            consumo_promedio, consumo_promedio1_5, consumo_promedio4_5, estado_inventario,
            fecha_inicial, fecha_final
          ) VALUES (
            ${codestablecimiento},
            ${dato.gru_codigo},
            ${dato.med_codigo},
            ${dato.gru_descripcion},
            ${dato.med_comercial},
            ${dato.med_codificacion},
            ${dato.med_unidad},
            ${dato.med_concentracion},
            ${dato.med_tipo},
            ${dato.tipo_med},
            ${dato.ant_entradas || 0},
            ${dato.ant_salidas || 0},
            ${dato.saldo_inicial || 0},
            ${dato.ant_entradas_costo || 0},
            ${dato.ant_salidas_costo || 0},
            ${dato.saldo_inicial_costo || 0},
            ${dato.entradas || 0},
            ${dato.salidas || 0},
            ${dato.saldo || 0},
            ${dato.entradas_costo || 0},
            ${dato.salidas_costo || 0},
            ${dato.costo || 0},
            ${dato.meses_activos || 0},
            ${dato.consumo_promedio || 0},
            ${dato.consumo_promedio1_5 || 0},
            ${dato.consumo_promedio4_5 || 0},
            ${dato.estado_inventario || null},
            ${dato.fecha_inicial},
            ${dato.fecha_final}
          )
        `;
      })
    );

    logger.info(`✅ Lote ${loteNumero} procesado con éxito.`);
    res
      .status(200)
      .json({ message: `Lote ${loteNumero} procesado con éxito.` });
  } catch (error: any) {
    logger.error("❌ Error al procesar los datos:", error.message || error);
    res.status(500).json({
      message: "Error interno del servidor.",
      error: error.message || "Ocurrió un error inesperado.",
    });
  }
};
