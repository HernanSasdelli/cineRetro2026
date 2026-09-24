import { Component, OnInit, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PeliculasService } from '../../core/services/peliculas.service';
import { Pelicula } from '../../core/models/pelicula';
import { DuracionPipe } from '../../shared/pipes/duracion.pipe';

@Component({
  selector: 'app-pelicula-detalle',
  imports: [RouterLink, DuracionPipe],
  templateUrl: './pelicula-detalle.html',
  styleUrl: './pelicula-detalle.scss',
})
export class PeliculaDetalle implements OnInit {
  private pelisService = inject(PeliculasService);

  // viene de la ruta pelicula/:id
  id = input.required<string>();

  peli = signal<Pelicula | null>(null);
  error = signal('');

  async ngOnInit() {
    try {
      this.peli.set(await this.pelisService.obtener(Number(this.id())));
    } catch {
      // si esta oculta la RLS no la devuelve
      this.error.set('Esta película no está disponible.');
    }
  }

  sinPoster(e: Event) {
    (e.target as HTMLImageElement).src = '/posters/placeholder.svg';
  }
}