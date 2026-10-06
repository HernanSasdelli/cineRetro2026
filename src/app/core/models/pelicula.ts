export interface Genero {
  id: number;
  nombre: string;
}

export interface Pelicula {
  id: number;
  titulo: string;
  sinopsis: string;
  duracion_min: number;
  imagen_url: string | null;    // poster vertical
  banner_url: string | null;    // imagen horizontal para las mas vistas
  restriccion_edad: number; // 0, 13 o 18
  activa: boolean;
  generos: Genero[];
  fecha_estreno: string | null;     // null es que ya esta estrenada
  tiene_preventa: boolean;
  precio_preventa: number | null;
  promedio?: number;   // no esta en la tabla, lo pego en la cartelera
  
 
}

export type NuevaPelicula = Omit<Pelicula, 'id' | 'activa' | 'generos'>;


