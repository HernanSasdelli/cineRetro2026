import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CandyService } from '../../../core/services/candy.service';
import { PeliculasService } from '../../../core/services/peliculas.service';
import { Categoria, TipoProducto } from '../../../core/models/candy';
import { ConCambios } from '../../../core/guards/cambios.guard';
import { ajustarImagen } from '../../../shared/utils/imagen';

// form para crear un producto o un combo (combo = incluye una entrada)
// foto cuadrada para todos, banner solo para combos
@Component({
  selector: 'app-candy-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './candy-form.html',
  styleUrl: './candy-form.scss',
})
export class CandyForm implements ConCambios {
  private fb = inject(FormBuilder);
  private candyService = inject(CandyService);
  private pelisService = inject(PeliculasService);
  private router = inject(Router);

  error = signal('');
  guardando = signal(false);
  private guardado = false;

  tipos: TipoProducto[] = ['producto', 'combo'];
  categorias: Categoria[] = ['Pochoclos', 'Bebidas', 'Golosinas'];

  // fotos elegidas, ajustadas pero sin subir
  fotoNueva: Blob | null = null;
  bannerNuevo: Blob | null = null;
  fotoVista = signal('');
  bannerVista = signal('');

  form = this.fb.group({
    nombre: ['', Validators.required],
    descripcion: [''],
    tipo: ['producto' as TipoProducto],
    categoria: ['Pochoclos' as Categoria],
    precio: [0, [Validators.required, Validators.min(1)]],
  });

  // lo pregunta el cambiosGuard al salir
  tieneCambios() {
    return !this.guardado && (this.form.dirty || this.fotoNueva !== null || this.bannerNuevo !== null);
  }

  // chips, con setValue hay que marcar el cambio a mano
  elegirTipo(t: TipoProducto) {
    this.form.controls.tipo.setValue(t);
    this.form.markAsDirty();
  }

  elegirCategoria(c: Categoria) {
    this.form.controls.categoria.setValue(c);
    this.form.markAsDirty();
  }

  // foto cuadrada para todos, 600x600
  async elegirFoto(e: Event) {
    const archivo = (e.target as HTMLInputElement).files?.[0];
    if (!archivo) return;
    try {
      this.fotoNueva = await ajustarImagen(archivo, 600, 600);
      this.fotoVista.set(URL.createObjectURL(this.fotoNueva));
    } catch {
      this.error.set('Ese archivo no es una imagen.');
    }
  }

  // banner solo para combos, igual que el de las peliculas
  async elegirBanner(e: Event) {
    const archivo = (e.target as HTMLInputElement).files?.[0];
    if (!archivo) return;
    try {
      this.bannerNuevo = await ajustarImagen(archivo, 1600, 600);
      this.bannerVista.set(URL.createObjectURL(this.bannerNuevo));
    } catch {
      this.error.set('Ese archivo no es una imagen.');
    }
  }

  // sube las fotos y despues crea el producto con sus links
  async crear() {
    const esCombo = this.form.value.tipo === 'combo';
    if (this.form.invalid || !this.fotoNueva || (esCombo && !this.bannerNuevo)) {
      this.form.markAllAsTouched();
      this.error.set(esCombo
        ? 'Faltan datos: un combo necesita nombre, precio, foto y banner.'
        : 'Faltan datos: un producto necesita nombre, precio y foto.');
      return;
    }
    this.error.set('');
    this.guardando.set(true);
    const v = this.form.value;

    try {
      const imagen = await this.pelisService.subirImagen(this.fotoNueva, 'producto');
      let banner: string | null = null;
      if (esCombo && this.bannerNuevo) {
        banner = await this.pelisService.subirImagen(this.bannerNuevo, 'banner');
      }

      await this.candyService.crear({
        nombre: v.nombre ?? '',
        descripcion: v.descripcion ?? '',
        tipo: v.tipo as TipoProducto,
        categoria: esCombo ? null : (v.categoria as Categoria),   // los combos no tienen categoria
        precio: Number(v.precio),
        imagen_url: imagen,
        banner_url: banner,
      });

      this.guardado = true;   // ya guarde, que el guard no pregunte
      this.router.navigate(['/admin/candy']);
    } catch {
      this.error.set('No se pudo crear el producto. Probá de nuevo.');
    } finally {
      this.guardando.set(false);
    }
  }
}