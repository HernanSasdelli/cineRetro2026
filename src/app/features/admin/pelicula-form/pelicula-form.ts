import { Component, OnInit, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PeliculasService } from '../../../core/services/peliculas.service';
import { Genero } from '../../../core/models/pelicula';
import { ConCambios } from '../../../core/guards/cambios.guard';
import { ajustarImagen } from '../../../shared/utils/imagen';

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
  edades = [0, 13, 18]; // 0 es ATP
  hoy = new Date().toISOString().slice(0, 10); // el estreno no puede ser antes de hoy

  //-----MEJORA DE IMAGENES-----
  posterGuardado = signal('');
  bannerGuardado = signal('');
  posterNuevo: Blob | null = null;
  bannerNuevo: Blob | null = null;
  posterVista = signal(''); // vista previa de la que eligio
  bannerVista = signal('');
  errorFotos = signal('');

  form = this.fb.group({
    titulo: ['', [Validators.required, Validators.maxLength(120)]],
    sinopsis: ['', [Validators.required, Validators.maxLength(600)]],
    duracion_min: [90, [Validators.required, Validators.min(1), Validators.max(400)]],
    restriccion_edad: [0],
    /// imagen_url: [''],
    // required con la lista vacia tambien da invalido
    generoIds: [[] as number[], Validators.required],
    fecha_estreno: [''],
    tiene_preventa: [false],
    precio_preventa: [0],
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
          //imagen_url: p.imagen_url ?? '',
          generoIds: ids,
          fecha_estreno: p.fecha_estreno ?? '',
          tiene_preventa: p.tiene_preventa,
          precio_preventa: p.precio_preventa ?? 0,
        });
        this.posterGuardado.set(p.imagen_url ?? '');
        this.bannerGuardado.set(p.banner_url ?? '');
        // editando, los datos de estreno no se tocan, quedan en gris porque permite errores
        this.form.controls.fecha_estreno.disable();
        this.form.controls.tiene_preventa.disable();
        this.form.controls.precio_preventa.disable();
      }
    } catch {
      this.error.set('No se pudo cargar la película.');
    }
  }

  // lo pregunta el cambiosGuard al salir, cuenta tambien si eligio fotos nuevas
  tieneCambios() {
    return this.form.dirty || this.posterNuevo !== null || this.bannerNuevo !== null;
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
      if (g !== id) nueva.push(g); // copio todos menos el que toque
    }
    if (!actuales.includes(id)) nueva.push(id); // si no estaba lo agrego
    this.form.controls.generoIds.setValue(nueva);
    this.form.controls.generoIds.markAsTouched();
    this.form.controls.generoIds.markAsDirty(); // con setValue no se marca solo
  }

  /*// si hay id actualiza, si no crea
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
  }*/

  // primero subo las fotos nuevas, despues guardo la peli con sus links
  async guardar() {    

    // las dos fotos son obligatorias: o ya estaba guardada o eligio una nueva
    const faltaPoster = !this.posterNuevo && !this.posterGuardado();
    const faltaBanner = !this.bannerNuevo && !this.bannerGuardado();
    if (faltaPoster || faltaBanner) {
      this.errorFotos.set('Faltan imágenes: el póster y el banner son obligatorios.');
    }
    // si tiene preventa, necesita fecha de estreno y precio
    const v0 = this.form.getRawValue();
    const preventaMal = v0.tiene_preventa && (!v0.fecha_estreno || !(v0.precio_preventa > 0));
    if (preventaMal) {
      this.error.set('Para tener preventa hace falta la fecha de estreno y el precio de preventa.');
    }
    //if (this.form.invalid || faltaPoster || faltaBanner ||) {
    if (this.form.invalid || faltaPoster || faltaBanner || preventaMal) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.error.set('');
    const v = this.form.getRawValue();

    try {
      // si eligio una foto nueva la subo, si no queda la que estaba
      let poster = this.posterGuardado();
      if (this.posterNuevo) {
        poster = await this.pelisService.subirImagen(this.posterNuevo, 'poster');
      }
      let banner = this.bannerGuardado();
      if (this.bannerNuevo) {
        banner = await this.pelisService.subirImagen(this.bannerNuevo, 'banner');
      }

      // armo la peli campo por campo, los generos van aparte
      const peli = {
        titulo: v.titulo,
        sinopsis: v.sinopsis,
        duracion_min: v.duracion_min,
        restriccion_edad: v.restriccion_edad,
        imagen_url: poster,
        banner_url: banner,
        fecha_estreno: v.fecha_estreno || null,
        tiene_preventa: v.tiene_preventa,
        precio_preventa: v.tiene_preventa ? v.precio_preventa : null,
      };

      if (this.id) {
        await this.pelisService.actualizar(Number(this.id), peli, v.generoIds);
      } else {
        await this.pelisService.crear(peli, v.generoIds);
      }

      // ya guarde, que el guard no pregunte
      this.posterNuevo = null;
      this.bannerNuevo = null;
      this.form.markAsPristine();
      this.router.navigate(['/admin/peliculas']);
    } catch {
      // cae aca si falla la base o el storage: sin conexion, sesion vencida o si ya no es admin
      this.error.set('No se pudo guardar la película. Probá de nuevo.');
    } finally {
      this.guardando.set(false);
    }
  }

  // los chips de edad usan setValue, hay que marcar el cambio a mano
  elegirEdad(e: number) {
    this.form.controls.restriccion_edad.setValue(e);
    this.form.markAsDirty();
  }

  // eligio un poster, lo ajusto a 600x900 y muestro como queda
  async elegirPoster(e: Event) {
    const archivo = (e.target as HTMLInputElement).files?.[0];
    if (!archivo) return;
    try {
      this.posterNuevo = await ajustarImagen(archivo, 600, 900);
      this.posterVista.set(URL.createObjectURL(this.posterNuevo));
      this.errorFotos.set('');
    } catch {
      this.errorFotos.set('Ese archivo no es una imagen.');
    }
  }

  // lo mismo para el banner, 1600x600
  async elegirBanner(e: Event) {
    const archivo = (e.target as HTMLInputElement).files?.[0];
    if (!archivo) return;
    try {
      this.bannerNuevo = await ajustarImagen(archivo, 1600, 600);
      this.bannerVista.set(URL.createObjectURL(this.bannerNuevo));
      this.errorFotos.set('');
    } catch {
      this.errorFotos.set('Ese archivo no es una imagen.');
    }
  }
}
