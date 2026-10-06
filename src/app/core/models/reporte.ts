// lo que devuelve la funcion reporte de la base

export interface DiaReporte {
  fecha: string;      // yyyy-mm-dd
  entradas: number;
  total: number;
}

export interface PeliculaReporte {
  titulo: string;
  entradas: number;
  total: number;
}

export interface CandyReporte {
  nombre: string;
  cantidad: number;
  total: number;
}

export interface Reporte {
  dias: DiaReporte[];
  peliculas: PeliculaReporte[];
  candy: CandyReporte[];
  total: number;        // facturado en todo el periodo
  entradas: number;     // entradas vendidas en todo el periodo
}