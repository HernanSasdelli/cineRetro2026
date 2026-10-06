import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ResenasService } from '../../core/services/resenas.service';
import { ComprasService } from '../../core/services/compras.service';
import { MiPelicula } from '../../core/models/resena';
import { EstrellasPipe } from '../../shared/pipes/estrellas.pipe';
import { ConCambios } from '../../core/guards/cambios.guard';
import { Modal } from '../../shared/components/modal/modal';

// mis peliculas: arriba las que voy a ver, abajo las que ya vi
// desde las ya vistas se puntua, una sola vez
// las proximas se pueden cancelar hasta 2 horas antes, vuelve todo como credito
// las canceladas van en su propia lista, no se puntuan
@Component({
  selector: 'app-mis-peliculas',
  imports: [DatePipe, CurrencyPipe, RouterLink, EstrellasPipe, Modal],
  templateUrl: './mis-peliculas.html',
  styleUrl: './mis-peliculas.scss',
})
export class MisPeliculas implements OnInit, ConCambios {
  private resenasService = inject(ResenasService);
  private comprasService = inject(ComprasService);

  lista = signal<MiPelicula[]>([]);
  error = signal('');
  calificando = signal<number | null>(null);   // la peli que esta puntuando
  estrellas = signal(0);
  comentario = signal('');
  enviando = signal(false);
  opciones = [1, 2, 3, 4, 5];

  // cartel de cancelar
  aCancelar = signal<MiPelicula | null>(null);
  cancelando = signal(false);
  errorCancelar = signal('');

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

  // las que todavia no empezaron. las canceladas no van, no voy a ir
  proximas() {
    const ahora = new Date();
    const res: MiPelicula[] = [];
    for (const m of this.lista()) {
      if (!m.cancelada_en && new Date(m.inicio) > ahora) res.push(m);
    }
    return res;
  }

  // las que ya empezaron. las canceladas no van, no la vi asi que no la puedo puntuar
  vistas() {
    const ahora = new Date();
    const res: MiPelicula[] = [];
    for (const m of this.lista()) {
      if (!m.cancelada_en && new Date(m.inicio) <= ahora) res.push(m);
    }
    return res;
  }

  // las que cancele, van aparte
  canceladas() {
    const res: MiPelicula[] = [];
    for (const m of this.lista()) {
      if (m.cancelada_en) res.push(m);
    }
    return res;
  }

  // se puede cancelar si faltan mas de 2 horas (la base lo vuelve a revisar)
  puedeCancelar(m: MiPelicula) {
    const dosHoras = 2 * 60 * 60 * 1000;
    return new Date(m.inicio).getTime() - Date.now() > dosHoras;
  }

  pedirCancelar(m: MiPelicula) {
    this.errorCancelar.set('');
    this.aCancelar.set(m);
  }

  cerrarCancelar() {
    this.aCancelar.set(null);
  }

  // confirmo en el cartel: la base cancela, libera las butacas y me da el credito
  async confirmarCancelar() {
    const m = this.aCancelar();
    if (!m) return;
    this.cancelando.set(true);
    try {
      await this.comprasService.cancelar(m.codigo);
      this.aCancelar.set(null);
      await this.cargar();
    } catch (e: any) {
      this.errorCancelar.set(e.message ?? 'No se pudo cancelar la compra.');
    } finally {
      this.cancelando.set(false);
    }
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