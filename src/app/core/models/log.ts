// una linea del log, como la devuelve la funcion ver_log
export interface LogItem {
  id: number;
  quien: string;       // nombre y apellido, o anonimo
  accion: string;      // Creó, Modificó, Eliminó, Validó, Entregó, Canceló
  detalle: string;     // sobre que fue
  creado_en: string;
}