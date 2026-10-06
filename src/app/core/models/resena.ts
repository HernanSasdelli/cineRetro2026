// una reseña como la muestra el detalle
export interface Resena {
  nombre: string;
  estrellas: number;
  comentario: string | null;
  creada_en: string;
}

// promedio de una peli
export interface Promedio {
  pelicula_id: number;
  promedio: number;
}

// una compra del usuario para mis peliculas
export interface MiPelicula {
  codigo: string;
  pelicula_id: number;
  titulo: string;
  imagen_url: string | null;
  inicio: string;
  sala: string;
  butacas: string[];
  estrellas: number | null;    // null es que todavia no la puntuo
  comentario: string | null;
  total: number;   // para el cartel de cancelar
  cancelada_en: string | null;   // null es que no se cancelo
}