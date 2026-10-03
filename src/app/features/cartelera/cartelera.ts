import { Component, OnInit, inject, signal } from '@angular/core';

import { PeliculasService } from '../../core/services/peliculas.service';
import { Genero, Pelicula } from '../../core/models/pelicula';

import { BuscarPipe } from '../../shared/pipes/buscar.pipe';
import { TarjetaPelicula } from './tarjeta-pelicula/tarjeta-pelicula';

@Component({
  selector: 'app-cartelera',
  imports: [BuscarPipe, TarjetaPelicula],
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

    //aca esta el cach que no entendia!! es igual que en c#
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

//eñ sin poster lo mande a  la tarjeta de la peli, no vive mas en el padre
}
