import { Component, OnDestroy, input, signal } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Pelicula } from '../../../core/models/pelicula';

// slider de las mas vistas: muestra el banner de a una y pasa sola cada 5 segundos
// las pelis me las pasa la cartelera
@Component({
  selector: 'app-slider-destacadas',
  imports: [UpperCasePipe, RouterLink],
  templateUrl: './slider-destacadas.html',
  styleUrl: './slider-destacadas.scss',
})
export class SliderDestacadas implements OnDestroy {
  peliculas = input.required<Pelicula[]>();
  actual = signal(0);   // cual se esta mostrando

  // cada 5 segundos pasa a la siguiente
  private reloj = setInterval(() => this.siguiente(), 5000);

  // cuando me voy de la pantalla freno el reloj, si no sigue andando aunque no se vea
  ngOnDestroy() {
    clearInterval(this.reloj);
  }

  // el % hace que despues de la ultima vuelva a la primera
  siguiente() {
    const total = this.peliculas().length;
    if (total === 0) return;
    this.actual.set((this.actual() + 1) % total);
  }

  // sumo total antes del % para que antes de la primera vaya a la ultima
  anterior() {
    const total = this.peliculas().length;
    if (total === 0) return;
    this.actual.set((this.actual() - 1 + total) % total);
  }

  ir(i: number) {
    this.actual.set(i);
  }

  // 0, 1, 2 para dibujar un puntito por peli
  indices() {
    const lista: number[] = [];
    for (let i = 0; i < this.peliculas().length; i++) {
      lista.push(i);
    }
    return lista;
  }

  // si el banner no carga, el cartel de reemplazo
  sinBanner(e: Event) {
    (e.target as HTMLImageElement).src = '/banner-placeholder.svg';
  }
}