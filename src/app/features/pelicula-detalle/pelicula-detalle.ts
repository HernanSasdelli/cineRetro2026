import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';;
import { PeliculasService } from '../../core/services/peliculas.service';
import { Pelicula } from '../../core/models/pelicula';
import { DuracionPipe } from '../../shared/pipes/duracion.pipe';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { FuncionesService } from '../../core/services/funciones.service';
import { FuncionConDatos } from '../../core/models/funcion';

@Component({
  selector: 'app-pelicula-detalle',
  imports: [RouterLink, DuracionPipe, DatePipe, TitleCasePipe],
  templateUrl: './pelicula-detalle.html',
  styleUrl: './pelicula-detalle.scss',
})
export class PeliculaDetalle implements OnInit {
  private pelisService = inject(PeliculasService);
    private funcionesService = inject(FuncionesService);
  funciones = signal<FuncionConDatos[]>([]);

private route = inject(ActivatedRoute);

  peli = signal<Pelicula | null>(null);
  error = signal('');

// al iniciar, saco el id de la url y busco la pelicula
async ngOnInit() {
  // snapshot: foto de la url en este momento, aca el id no cambia
  const id = Number(this.route.snapshot.paramMap.get('id'));
  try {
    this.peli.set(await this.pelisService.obtener(id));
    this.funciones.set(await this.funcionesService.dePelicula(id));
  } catch {
    // si esta oculta la RLS no la devuelve
    this.error.set('Esta película no está disponible.');
  }
}

  sinPoster(e: Event) {
    (e.target as HTMLImageElement).src = '/posters/placeholder.svg';
  }
}