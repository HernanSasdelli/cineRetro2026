import { Component, OnInit, inject, signal } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { PeliculasService } from '../../core/services/peliculas.service';
import { Genero, Pelicula } from '../../core/models/pelicula';
import { DuracionPipe } from '../../shared/pipes/duracion.pipe';
import { BuscarPipe } from '../../shared/pipes/buscar.pipe';

@Component({
  selector: 'app-cartelera',
  imports: [UpperCasePipe, DuracionPipe, BuscarPipe],
  templateUrl: './cartelera.html',
  styleUrl: './cartelera.scss',
})
export class Cartelera implements OnInit {
  private pelisService = inject(PeliculasService);

  peliculas = signal<Pelicula[]>([]);
  generos = signal<Genero[]>([]);
  texto = signal('');
  generoId = signal<number | null>(null);
  cargando = signal(true);
  error = signal('');

  async ngOnInit() {
    try {
      const [pelis, gens] = await Promise.all([
        this.pelisService.listar(),
        this.pelisService.generos(),
      ]);
      this.peliculas.set(pelis);
      this.generos.set(gens);
    } catch {
      this.error.set('No se pudo cargar la cartelera. Revisá la conexión y recargá la página.');
    } finally {
      this.cargando.set(false);
    }
  }

  buscar(e: Event) {
    this.texto.set((e.target as HTMLInputElement).value);
  }

  // si todavia no hice el poster
  sinPoster(e: Event) {
    (e.target as HTMLImageElement).src = '/posters/placeholder.svg';
  }
}
