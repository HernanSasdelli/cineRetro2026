import { Pelicula } from '../../core/models/pelicula';

// en que estado esta una peli segun su fecha de estreno
// cartelera: ya se estreno o no tiene fecha
// preventa: faltan 7 dias o menos y tiene preventa
// proximamente: todavia no se puede comprar

export function estadoPelicula(p: Pelicula): 'cartelera' | 'preventa' | 'proximamente' {
  const hoy = new Date().toISOString().slice(0, 10);
  if (!p.fecha_estreno || hoy >= p.fecha_estreno) return 'cartelera';
  if (p.tiene_preventa && hoy >= inicioPreventa(p)) return 'preventa';
  return 'proximamente';
}

// dia que arranca la preventa, 7 dias antes del estreno
export function inicioPreventa(p: Pelicula) {
  const d = new Date(p.fecha_estreno + 'T00:00');
  d.setDate(d.getDate() - 7);
  return d.toISOString().slice(0, 10);
}