
//es como una interface en c#
// formatos e idiomas que acepta la base
export type Formato = '2D' | '3D' | '4D' | '5D';
export type Idioma = 'castellano' | 'subtitulada';

// una sala del cine (tabla salas)
export interface Sala {
  id: number;
  nombre: string;
  activa: boolean;
}

// una funcion: pelicula + sala + horario (tabla funciones)
export interface Funcion {
  id: number;
  pelicula_id: number;
  sala_id: number;
  inicio: string;      // fecha y hora, viene como texto desde supabase
  formato: Formato;
  idioma: Idioma;
  precio: number;
}
// precio sugerido por formato (tabla precios)
export interface Precio {
  formato: Formato;
  precio: number;
}