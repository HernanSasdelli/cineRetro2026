import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';;
import { PeliculasService } from '../../core/services/peliculas.service';
import { Pelicula } from '../../core/models/pelicula';
import { DuracionPipe } from '../../shared/pipes/duracion.pipe';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { FuncionesService } from '../../core/services/funciones.service';
import { FuncionConDatos } from '../../core/models/funcion';
import { AuthService } from '../../core/services/auth.service';
import { AlertasService } from '../../core/services/alertas.service';
import { estadoPelicula, inicioPreventa } from '../../shared/utils/estreno';

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
  protected auth = inject(AuthService);   // el html pregunta si esta logueado
  private alertasService = inject(AlertasService);
  tieneAlerta = signal(false);

// al iniciar, saco el id de la url y busco la pelicula
async ngOnInit() {
  // snapshot: foto de la url en este momento, aca el id no cambia
  const id = Number(this.route.snapshot.paramMap.get('id'));
  try {
    this.peli.set(await this.pelisService.obtener(id));
    this.funciones.set(await this.funcionesService.dePelicula(id));

    // si esta logueado, me fijo si ya pidio que le avisen de esta peli
    await this.auth.listo;
    if (this.auth.logueado()) {
      this.tieneAlerta.set(await this.alertasService.tengo(id));
    }


  } catch {
    // si esta oculta la RLS no la devuelve
    this.error.set('Esta película no está disponible.');
  }
}

  // cartelera, preventa o proximamente
  estado() {
    const p = this.peli();
    if (!p) return 'cartelera';
    return estadoPelicula(p);
  }

  // dia que se puede empezar a comprar: el de la preventa si tiene, si no el estreno
  ventaDesde() {
    const p = this.peli();
    if (!p) return '';
    if (p.tiene_preventa) return inicioPreventa(p);
    return p.fecha_estreno ?? '';
  }

  // boton avisame: si no la tenia la activo, si la tenia la saco
  async cambiarAlerta() {
    const p = this.peli();
    if (!p) return;
    try {
      if (this.tieneAlerta()) {
        await this.alertasService.quitar(p.id);
        this.tieneAlerta.set(false);
      } else {
        await this.alertasService.activar(p.id);
        this.tieneAlerta.set(true);
      }
    } catch {
      this.error.set('No se pudo guardar la alerta. Probá de nuevo.');
    }
  }

  sinPoster(e: Event) {
    (e.target as HTMLImageElement).src = '/posters/placeholder.svg';
  }
}