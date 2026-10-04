import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router} from '@angular/router';
import { Pelicula } from '../../../core/models/pelicula';

import { PeliculasService } from '../../../core/services/peliculas.service';
import { FuncionesService } from '../../../core/services/funciones.service';
import { ConCambios } from '../../../core/guards/cambios.guard';
import { Formato, Idioma, Sala } from '../../../core/models/funcion';


@Component({
  selector: 'app-funcion-form',
  imports: [ReactiveFormsModule],
  templateUrl: './funcion-form.html',
  styleUrl: './funcion-form.scss',
})
export class FuncionForm implements OnInit, ConCambios {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private pelisService = inject(PeliculasService);
  private funcionesService = inject(FuncionesService);

  peliculas = signal<Pelicula[]>([]);
  salas = signal<Sala[]>([]);
  error = signal('');
  guardando = signal(false);
  private guardado = false;

  form = this.fb.group({
    pelicula_id: ['', Validators.required],
    sala_id: ['', Validators.required],
    fecha: ['', Validators.required],
    hora: ['', Validators.required],
    formato: ['2D', Validators.required],
    idioma: ['castellano', Validators.required],
    precio: [0, [Validators.required, Validators.min(1)]],
  });

  // al entrar cargo peliculas y salas para los desplegables
  async ngOnInit() {
    try {
      this.peliculas.set(await this.pelisService.listar());
      this.salas.set(await this.funcionesService.salas());
    } catch {
      this.error.set('No se pudieron cargar las películas o las salas.');
    }
  }

  // la llama el cambiosGuard antes de salir
  tieneCambios() {
    return this.form.dirty && !this.guardado;
  }

    // arma la funcion con los datos del form y la manda a la base
  async guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();   // pinta en rojo lo que falta, buscar en el video de la 4
      return;
    }
    this.error.set('');
    this.guardando.set(true);
    const v = this.form.value;
    try {
      await this.funcionesService.crear({
        pelicula_id: Number(v.pelicula_id),
        sala_id: Number(v.sala_id),
        // junto fecha y hora del form (hora argentina) en un solo dato
        inicio: new Date(v.fecha + 'T' + v.hora).toISOString(),
        formato: v.formato as Formato,
        idioma: v.idioma as Idioma,
        precio: Number(v.precio),
      });
      this.guardado = true;
      this.router.navigate(['/admin']);
    } catch (e: any) {
      // 23P01 = la base dice que se pisa con otra funcion en esa sala
      if (e.code === '23P01') {
        this.error.set('Esa sala ya tiene una función en ese horario (contando 30 min de limpieza).');
      } else {
        this.error.set('No se pudo guardar la función.');
      }
    } finally {
      this.guardando.set(false);
    }
  }
}
