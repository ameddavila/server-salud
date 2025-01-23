import { Request, Response } from "express";
import sql from "../config/database"; // Configuración de la conexión con la base de datos
import { Medicamento } from "../types/medicamento";
import { state } from "../utils/state"; // Estado global manejado con un módulo

/**
 * Transforma los datos para ajustar los tipos de valores.
 * Convierte valores decimales a enteros para columnas que esperan enteros.
 *
 * @param datos - Arreglo de objetos con los datos recibidos
 * @returns Nuevo arreglo con los valores ajustados
 */
const ajustarTipos = (datos: Medicamento[]): Medicamento[] => {
  return datos.map((dato) => ({
    ...dato,
    consumo_promedio1_5: Math.floor(dato.consumo_promedio1_5 || 0),
    consumo_promedio4_5: Math.floor(dato.consumo_promedio4_5 || 0),
  }));
};

/**
 * Procesa y almacena todos los lotes recibidos, asegurándose de borrar previamente
 * todos los registros relacionados con el `codestablecimiento`.
 */
export const receiveData = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Obtener el payload enviado por el cliente
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

    // Validar el formato del payload
    if (!Array.isArray(datos) || datos.length === 0) {
      res.status(400).json({
        message: "Formato de datos inválido. Se esperaba un arreglo no vacío.",
      });
      return;
    }

    // Extraer el código de establecimiento del primer registro
    const codestablecimiento = datos[0]?.codestablecimiento;

    if (!codestablecimiento) {
      res.status(400).json({
        message: 'El campo "codestablecimiento" es requerido en los datos.',
      });
      return;
    }

    // Registrar información del lote recibido
    console.log(`Recibiendo lote ${loteNumero} de ${totalLotes}`);
    console.log(`Total de datos en el lote: ${datos.length}`);
    console.log(`Total de datos esperados: ${totalDatos}`);

    // Eliminar todos los registros relacionados con el `codestablecimiento` (solo una vez)
    if (loteNumero === 1) {
      console.log(
        `Eliminando registros anteriores para codestablecimiento: ${codestablecimiento}`
      );

      await sql`
        DELETE FROM medicamentos WHERE codestablecimiento = ${codestablecimiento}
      `;

      console.log(
        `Registros eliminados para codestablecimiento: ${codestablecimiento}`
      );
    }

    // Ajustar los tipos de datos antes de la inserción
    const datosAjustados = ajustarTipos(datos);

    // Insertar todos los registros en la base de datos en una sola operación
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
            ${dato.codestablecimiento},
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

    console.log(`Lote ${loteNumero} procesado con éxito.`);
    res
      .status(200)
      .json({ message: `Lote ${loteNumero} procesado con éxito.` });
  } catch (error: any) {
    console.error("Error al procesar los datos:", error.message || error);
    res.status(500).json({
      message: "Error interno del servidor.",
      error: error.message || "Ocurrió un error inesperado.",
    });
  }
};

/**
 * Controlador para probar la recepción y registro de datos sin procesarlos.
 *
 * @param req - Objeto de solicitud HTTP
 * @param res - Objeto de respuesta HTTP
 */
export const receiveDataLogOnly = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Log de los datos recibidos
    console.log("Datos recibidos:", req.body);

    res.status(200).json({ message: "Datos recibidos correctamente." });
  } catch (error) {
    console.error("Error al procesar los datos en el servidor central:", error);
    res.status(500).json({ message: "Error interno en el servidor central." });
  }
};
