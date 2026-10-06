import { Component, input } from '@angular/core';
import { UpperCasePipe , DatePipe} from '@angular/common';// estp es el pipe que hace la mayusculas (upper)
import { RouterLink } from '@angular/router';
import { Pelicula } from '../../../core/models/pelicula';
import { DuracionPipe } from '../../../shared/pipes/duracion.pipe';
import { estadoPelicula, inicioPreventa } from '../../../shared/utils/estreno';

//el pipe cambia la forma de mostrar el dato en la pantalla. No lo cambia en la base.(clase 7)
@Component({
  selector: 'app-tarjeta-pelicula',
  imports: [UpperCasePipe, DuracionPipe, RouterLink, DatePipe],
  templateUrl: './tarjeta-pelicula.html',
  styleUrl: './tarjeta-pelicula.scss',
})
export class TarjetaPelicula {
  // la pelicula me la pasa el padre (cartelera)
  pelicula = input.required<Pelicula>(); // input de la señal()

  // arma "Drama, Comedia" con los nombres de los generos
  generosTexto() {
    return this.pelicula().generos.map(g => g.nombre).join(', ');
  }
    // cartelera, preventa o proximamente, para el cartelito
  estado() {
    return estadoPelicula(this.pelicula());
  }

  desdePreventa() {
    return inicioPreventa(this.pelicula());
  }

  // si todavia no hice el poster muestra la imagen por defecto. 
  sinPoster(e: Event) {
    (e.target as HTMLImageElement).src = '/posters/placeholder.svg';
  }
}