import { Request, Response } from 'express';
import sql from '../config/database';

/**
 * Transforma los datos para ajustar los tipos de valores.
 * Convierte valores decimales a enteros para columnas que esperan enteros.
 */
const ajustarTipos = (datos: any[]) => {
    return datos.map((dato) => ({
      ...dato,
      consumo_promedio1_5: Math.floor(dato.consumo_promedio1_5 || 0),
      consumo_promedio4_5: Math.floor(dato.consumo_promedio4_5 || 0),
    }));
  };
  
  export const receiveData = async (req: Request, res: Response): Promise<void> => {
    try {
      let datos = req.body;
  
      // Validar que los datos sean un arreglo
      if (!Array.isArray(datos) || datos.length === 0) {
        res.status(400).json({
          message: 'Formato de datos inválido. Se esperaba un arreglo no vacío.',
        });
        return;
      }
  
      // Ajustar los tipos de datos antes de la inserción
      datos = ajustarTipos(datos);
  
      console.log('Datos ajustados:', datos);
  
      // Insertar cada registro en la base de datos
      for (const dato of datos) {
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
            ${dato.codestablecimiento}, ${dato.gru_codigo}, ${dato.med_codigo}, ${dato.gru_descripcion},
            ${dato.med_comercial}, ${dato.med_codificacion}, ${dato.med_unidad}, ${dato.med_concentracion},
            ${dato.med_tipo}, ${dato.tipo_med}, ${dato.ant_entradas || 0}, ${dato.ant_salidas || 0},
            ${dato.saldo_inicial || 0}, ${dato.ant_entradas_costo || 0}, ${dato.ant_salidas_costo || 0},
            ${dato.saldo_inicial_costo || 0}, ${dato.entradas || 0}, ${dato.salidas || 0}, ${dato.saldo || 0},
            ${dato.entradas_costo || 0}, ${dato.salidas_costo || 0}, ${dato.costo || 0},
            ${dato.meses_activos || 0}, ${dato.consumo_promedio || 0}, ${dato.consumo_promedio1_5 || 0},
            ${dato.consumo_promedio4_5 || 0}, ${dato.estado_inventario || null}, ${dato.fecha_inicial},
            ${dato.fecha_final}
          )
        `;
      }
  
      res.status(200).json({ message: 'Datos almacenados con éxito.' });
    } catch (error: any) {
      console.error('Error al procesar los datos:', error.message || error);
      res.status(500).json({
        message: 'Error interno del servidor.',
        error: error.message || 'Ocurrió un error inesperado.',
      });
    }
  };
  

/**
 * Prueba para recibir y mostrar los datos sin procesar.
 */
export const receiveDataLogOnly = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Datos recibidos:', req.body);
    res.status(200).json({ message: 'Datos recibidos correctamente.' });
  } catch (error) {
    console.error('Error al procesar los datos en el servidor central:', error);
    res.status(500).json({ message: 'Error interno en el servidor central.' });
  }
};
