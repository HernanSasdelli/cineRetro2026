import { Pipe, PipeTransform } from '@angular/core';
import { Pelicula } from '../../core/models/pelicula';

// puro: solo se recalcula si cambia alguno de los 3 parametros
@Pipe({ name: 'buscar' })
export class BuscarPipe implements PipeTransform {
  transform(lista: Pelicula[], texto: string, generoId: number | null): Pelicula[] {
    const t = texto.trim().toLowerCase();
    return lista.filter(p =>
      (!t || p.titulo.toLowerCase().includes(t)) &&
      (generoId === null || p.generos.some(g => g.id === generoId))
    );
  }
}
