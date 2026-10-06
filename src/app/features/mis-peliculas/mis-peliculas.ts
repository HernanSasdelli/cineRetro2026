import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ResenasService } from '../../core/services/resenas.service';
import { MiPelicula } from '../../core/models/resena';
import { EstrellasPipe } from '../../shared/pipes/estrellas.pipe';
import { ConCambios } from '../../core/guards/cambios.guard';

// mis peliculas: arriba las que voy a ver, abajo las que ya vi
// desde las ya vistas se puntua, una sola vez
@Component({
  selector: 'app-mis-peliculas',
  imports: [DatePipe, RouterLink, EstrellasPipe],
  templateUrl: './mis-peliculas.html',
  styleUrl: './mis-peliculas.scss',
})
export class MisPeliculas implements OnInit, ConCambios {
  private resenasService = inject(ResenasService);

  lista = signal<MiPelicula[]>([]);
  error = signal('');
  calificando = signal<number | null>(null);   // la peli que esta puntuando
  estrellas = signal(0);
  comentario = signal('');
  enviando = signal(false);
  opciones = [1, 2, 3, 4, 5];

  async ngOnInit() {
    await this.cargar();
  }

  private async cargar() {
    try {
      this.lista.set(await this.resenasService.misPeliculas());
    } catch {
      this.error.set('No se pudieron cargar tus películas.');
    }
  }

  // las que todavia no empezaron
  proximas() {
    const ahora = new Date();
    const res: MiPelicula[] = [];
    for (const m of this.lista()) {
      if (new Date(m.inicio) > ahora) res.push(m);
    }
    return res;
  }

  // las que ya empezaron
  vistas() {
    const ahora = new Date();
    const res: MiPelicula[] = [];
    for (const m of this.lista()) {
      if (new Date(m.inicio) <= ahora) res.push(m);
    }
    return res;
  }

  empezar(m: MiPelicula) {
    this.calificando.set(m.pelicula_id);
    this.estrellas.set(0);
    this.comentario.set('');
    this.error.set('');
  }

  cancelar() {
    this.calificando.set(null);
  }

  escribirComentario(e: Event) {
    this.comentario.set((e.target as HTMLTextAreaElement).value);
  }

  // si empezo a puntuar y no publico, el guard pregunta
  tieneCambios() {
    return this.calificando() !== null && (this.estrellas() > 0 || this.comentario() !== '');
  }

  async publicar(m: MiPelicula) {
    if (this.estrellas() === 0) {
      this.error.set('Elegí cuántas estrellas le das.');
      return;
    }
    this.enviando.set(true);
    try {
      await this.resenasService.publicar(m.pelicula_id, this.estrellas(), this.comentario());
      this.calificando.set(null);
      await this.cargar();   // la traigo de nuevo, ya con su reseña
    } catch {
      this.error.set('No se pudo publicar la reseña. Probá de nuevo.');
    } finally {
      this.enviando.set(false);
    }
  }
}