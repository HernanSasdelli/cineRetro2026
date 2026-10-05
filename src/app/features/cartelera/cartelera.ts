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
destacadas = signal<Pelicula[]>([]);   // las 3 mas vendidas



  // al entrar: traigo peliculas, generos y las 3 mas vendidas
  async ngOnInit() {

     //aca esta el cach que no entendia!! es igual que en c#
    try {
      this.peliculas.set(await this.pelisService.listar());
      this.generos.set(await this.pelisService.generos());

      // busco en la lista que ya tengo las 3 mas vendidas, en el orden que vienen
      const ids = await this.pelisService.masVendidas();
      const lista: Pelicula[] = [];
      for (const id of ids) {
        for (const p of this.peliculas()) {
          if (p.id === id) lista.push(p);
        }
      }
      this.destacadas.set(lista);
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
