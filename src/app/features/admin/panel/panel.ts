import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PeliculasService } from '../../../core/services/peliculas.service';
import { Pelicula } from '../../../core/models/pelicula';
import { DuracionPipe } from '../../../shared/pipes/duracion.pipe';

@Component({
  selector: 'app-panel',
  imports: [RouterLink, DuracionPipe],
  templateUrl: './panel.html',
  styleUrl: './panel.scss',
})
export class Panel implements OnInit {
  private pelisService = inject(PeliculasService);
  peliculas = signal<Pelicula[]>([]);
  error = signal('');

  async ngOnInit() {
    try {
      this.peliculas.set(await this.pelisService.listar(false));
    } catch {
      this.error.set('No se pudieron cargar las películas.');
    }
  }
}
