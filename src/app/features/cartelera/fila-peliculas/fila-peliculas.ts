import { Component, input, signal } from '@angular/core';
import { Pelicula } from '../../../core/models/pelicula';
import { TarjetaPelicula } from '../tarjeta-pelicula/tarjeta-pelicula';

// fila de tarjetas de a 4 con flechas que dan la vuelta, como el slider de arriba
// la uso para preventa y proximamente, las pelis me las pasa la cartelera
@Component({
  selector: 'app-fila-peliculas',
  imports: [TarjetaPelicula],
  templateUrl: './fila-peliculas.html',
  styleUrl: './fila-peliculas.scss',
})
export class FilaPeliculas {

  
  peliculas = input.required<Pelicula[]>();
  inicio = signal(0);   // desde cual arranca a mostrar
  private porVez = 4;

  // si hay mas de 4 aparecen las flechas
  hayMas() {
    return this.peliculas().length > this.porVez;
  }

  // las 4 que se ven, empezando por inicio. el % hace que despues de la ultima siga la primera
  visibles() {
    const total = this.peliculas().length;
    if (!this.hayMas()) return this.peliculas();
    const lista: Pelicula[] = [];
    for (let i = 0; i < this.porVez; i++) {
      lista.push(this.peliculas()[(this.inicio() + i) % total]);
    }
    return lista;
  }

  siguiente() {
    const total = this.peliculas().length;
    this.inicio.set((this.inicio() + 1) % total);
  }

  anterior() {
    const total = this.peliculas().length;
    this.inicio.set((this.inicio() - 1 + total) % total);
  }
}