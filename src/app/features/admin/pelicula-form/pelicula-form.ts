import { Component, OnInit, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PeliculasService } from '../../../core/services/peliculas.service';
import { Genero } from '../../../core/models/pelicula';
import { ConCambios } from '../../../core/guards/cambios.guard';

// formulario de pelicula, sirve para crear y para editar
// si viene id en la url es editar, si no es nueva
// los generos se guardan aparte porque estan en otra tabla
@Component({
  selector: 'app-pelicula-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './pelicula-form.html',
  styleUrl: './pelicula-form.scss',
})
export class PeliculaForm implements OnInit, ConCambios {
  private fb = inject(NonNullableFormBuilder);
  private pelisService = inject(PeliculasService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // null es pelicula nueva, si viene un numero es editar
  id = this.route.snapshot.paramMap.get('id');

  generos = signal<Genero[]>([]);
  error = signal('');
  guardando = signal(false);
  edades = [0, 13, 18];   // 0 es ATP

  form = this.fb.group({
    titulo: ['', [Validators.required, Validators.maxLength(120)]],
    sinopsis: ['', [Validators.required, Validators.maxLength(600)]],
    duracion_min: [90, [Validators.required, Validators.min(1), Validators.max(400)]],
    restriccion_edad: [0],
    imagen_url: [''],
    // required con la lista vacia tambien da invalido
    generoIds: [[] as number[], Validators.required],
  });

  // traigo los generos para los chips, y si es editar cargo la peli en el form
  async ngOnInit() {
    try {
      this.generos.set(await this.pelisService.generos());

      if (this.id) {
        const p = await this.pelisService.obtener(Number(this.id));

        // ids de los generos que ya tiene
        const ids: number[] = [];
        for (const g of p.generos) {
          ids.push(g.id);
        }

        // setValue llena todo junto y no cuenta como cambio
        this.form.setValue({
          titulo: p.titulo,
          sinopsis: p.sinopsis,
          duracion_min: p.duracion_min,
          restriccion_edad: p.restriccion_edad,
          imagen_url: p.imagen_url ?? '',
          generoIds: ids,
        });
      }
    } catch {
      this.error.set('No se pudo cargar la película.');
    }
  }

  // lo pregunta el cambiosGuard al salir
  tieneCambios() {
    return this.form.dirty;
  }

  // toggleGenero(id: number) {
  //   const c = this.form.controls.generoIds;
  //   c.setValue(c.value.includes(id) ? c.value.filter(x => x !== id) : [...c.value, id]);
  //   c.markAsTouched();
  //   c.markAsDirty();
  // }

  // marca o desmarca un genero, igual que los dias en funciones
  toggleGenero(id: number) {
    const actuales = this.form.controls.generoIds.value;
    const nueva: number[] = [];
    for (const g of actuales) {
      if (g !== id) nueva.push(g);              // copio todos menos el que toque
    }
    if (!actuales.includes(id)) nueva.push(id);  // si no estaba lo agrego
    this.form.controls.generoIds.setValue(nueva);
    this.form.controls.generoIds.markAsTouched();
    this.form.controls.generoIds.markAsDirty();   // con setValue no se marca solo
  }

  // si hay id actualiza, si no crea
  async guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();   // muestra en rojo lo que falta
      return;
    }
    this.guardando.set(true);
    this.error.set('');

    const v = this.form.getRawValue();

    // armo la peli campo por campo
    const peli = {
      titulo: v.titulo,
      sinopsis: v.sinopsis,
      duracion_min: v.duracion_min,
      restriccion_edad: v.restriccion_edad,
      imagen_url: v.imagen_url || null,   //ver si deberia o no caargar la pelicula sin poester. 
    };

    try {
      if (this.id) {
        await this.pelisService.actualizar(Number(this.id), peli, v.generoIds);
      } else {
        await this.pelisService.crear(peli, v.generoIds);
      }
      this.form.markAsPristine();   // ya guarde, que el guard no pregunte si deseo salir
      this.router.navigate(['/admin/peliculas']);
    } catch {
      // si se desconecta la base, o hay error de validacion, muestra este cartel.
      this.error.set('No se pudo guardar la película. Intenta nuevamente.');
    } finally {
      this.guardando.set(false);
    }
  }
}