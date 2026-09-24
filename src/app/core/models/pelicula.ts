export interface Genero {
  id: number;
  nombre: string;
}

export interface Pelicula {
  id: number;
  titulo: string;
  sinopsis: string;
  duracion_min: number;
  imagen_url: string | null;
  restriccion_edad: number; // 0, 13 o 18
  activa: boolean;
  generos: Genero[];
}

export type NuevaPelicula = Omit<Pelicula, 'id' | 'activa' | 'generos'>;
