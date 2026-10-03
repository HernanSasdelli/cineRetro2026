import { Component, input } from '@angular/core';
import { UpperCasePipe } from '@angular/common';// estp es el pipe que hace la mayusculas (upper)
import { RouterLink } from '@angular/router';
import { Pelicula } from '../../../core/models/pelicula';
import { DuracionPipe } from '../../../shared/pipes/duracion.pipe';


//el pipe cambia la forma de mostrar el dato en la pantalla. No lo cambia en la base.(clase 7)
@Component({
  selector: 'app-tarjeta-pelicula',
  imports: [UpperCasePipe, DuracionPipe, RouterLink],
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

  // si todavia no hice el poster muestra la imagen por defecto. 
  sinPoster(e: Event) {
    (e.target as HTMLImageElement).src = '/posters/placeholder.svg';
  }
}