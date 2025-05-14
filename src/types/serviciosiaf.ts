export interface ServicioSiaf {
  codestablecimiento: number;
  vsersigla: string;
  cocdescri: string;
  fu_codigo: number;
  nombre: string;
  vrececha: string; // ISO string e.g. "2025-01-01T00:00:00.000Z"
  id_mes: number;
  anio: number;
  cantidad: number;
  costo: number;
  vdetpreuni: number;
  vclihiccli: number;
  tipo: string;
  vsercodigo: number;
  vgrucodigo: number;
  vserdescri: string;
}
