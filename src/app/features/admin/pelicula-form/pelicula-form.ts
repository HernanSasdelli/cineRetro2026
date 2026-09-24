import { Component, OnInit, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PeliculasService } from '../../../core/services/peliculas.service';
import { Genero } from '../../../core/models/pelicula';

@Component({
  selector: 'app-pelicula-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './pelicula-form.html',
  styleUrl: './pelicula-form.scss',
})
export class PeliculaForm implements OnInit {
  private fb = inject(NonNullableFormBuilder);
  private pelisService = inject(PeliculasService);
  private router = inject(Router);

  // llega solo desde la ruta peliculas/:id (withComponentInputBinding)
  id = input<string>();

  generos = signal<Genero[]>([]);
  error = signal('');
  guardando = signal(false);
  edades = [0, 13, 18];

  form = this.fb.group({
    titulo: ['', [Validators.required, Validators.maxLength(120)]],
    sinopsis: ['', [Validators.required, Validators.maxLength(600)]],
    duracion_min: [90, [Validators.required, Validators.min(1), Validators.max(400)]],
    restriccion_edad: [0],
    imagen_url: [''],
    // required con array vacio tambien da invalido
    generoIds: [[] as number[], Validators.required],
  });

  async ngOnInit() {
    try {
      this.generos.set(await this.pelisService.generos());

      const id = this.id();
      if (id) {
        const p = await this.pelisService.obtener(Number(id));
        this.form.setValue({
          titulo: p.titulo,
          sinopsis: p.sinopsis,
          duracion_min: p.duracion_min,
          restriccion_edad: p.restriccion_edad,
          imagen_url: p.imagen_url ?? '',
          generoIds: p.generos.map(g => g.id),
        });
      }
    } catch {
      this.error.set('No se pudo cargar la película.');
    }
  }

  toggleGenero(id: number) {
    const c = this.form.controls.generoIds;
    c.setValue(c.value.includes(id) ? c.value.filter(x => x !== id) : [...c.value, id]);
    c.markAsTouched();
  }

  async guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    this.error.set('');
    const { generoIds, imagen_url, ...resto } = this.form.getRawValue();
    const peli = { ...resto, imagen_url: imagen_url || null };

    try {
      const id = this.id();
      if (id) {
        await this.pelisService.actualizar(Number(id), peli, generoIds);
      } else {
        await this.pelisService.crear(peli, generoIds);
      }
      this.router.navigate(['/admin']);
    } catch {
      // si no sos admin la RLS lo rechaza y cae aca
      this.error.set('No se pudo guardar la película. Verificá que tu usuario sea admin.');
    } finally {
      this.guardando.set(false);
    }
  }
}