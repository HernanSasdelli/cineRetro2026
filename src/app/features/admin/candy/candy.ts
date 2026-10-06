import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CandyService } from '../../../core/services/candy.service';
import { Producto } from '../../../core/models/candy';
import { ConCambios } from '../../../core/guards/cambios.guard';
import { Modal } from '../../../shared/components/modal/modal';

// pestaña candy del admin: productos sueltos y combos (combo = incluye una entrada)
// la lista para cambiar precio y activar, cada cambio se confirma en el cartel
// el form para crear esta en su propia pantalla
@Component({
  selector: 'app-candy',
  imports: [RouterLink, CurrencyPipe, Modal],
  templateUrl: './candy.html',
  styleUrl: './candy.scss',
})
export class Candy implements OnInit, ConCambios {
  private candyService = inject(CandyService);

  productos = signal<Producto[]>([]);
  error = signal('');
  private cambiado = false;   // escribio un precio en la tabla y no lo guardo

  // el cartel de confirmar: que accion y sobre que producto
  accion = signal<'precio' | 'activo' | null>(null);
  elegido = signal<Producto | null>(null);
  trabajando = signal(false);
  errorCartel = signal('');

  async ngOnInit() {
    await this.cargar();
  }

  private async cargar() {
    try {
      this.productos.set(await this.candyService.listar());
    } catch {
      this.error.set('No se pudieron cargar los productos.');
    }
  }

  // lo pregunta el cambiosGuard: si escribio un precio y no lo guardo
  tieneCambios() {
    return this.cambiado;
  }

  // texto de la columna tipo
  tipoTexto(p: Producto) {
    return p.tipo === 'combo' ? 'Combo (incluye entrada)' : p.categoria;
  }

  // escribe un precio en la tabla, lo anoto pero todavia no va a la base
  escribirPrecio(p: Producto, e: Event) {
    p.precio = Number((e.target as HTMLInputElement).value);
    this.cambiado = true;
  }

  // tocaron guardar: primero reviso el numero y despues pregunto en el cartel
  pedirPrecio(p: Producto) {
    if (!(p.precio > 0)) {
      this.error.set('El precio tiene que ser mayor a 0.');
      return;
    }
    this.error.set('');
    this.errorCartel.set('');
    this.elegido.set(p);
    this.accion.set('precio');
  }

  // tocaron activar o desactivar: pregunto en el cartel
  pedirActivo(p: Producto) {
    this.error.set('');
    this.errorCartel.set('');
    this.elegido.set(p);
    this.accion.set('activo');
  }

  cerrarCartel() {
    this.elegido.set(null);
    this.accion.set(null);
  }

  // confirmaron en el cartel: hago lo que corresponda y recargo la lista
  async confirmar() {
    const p = this.elegido();
    if (!p) return;
    this.trabajando.set(true);
    try {
      if (this.accion() === 'precio') {
        await this.candyService.cambiarPrecio(p.id, p.precio);
        this.cambiado = false;
      } else {
        await this.candyService.cambiarActivo(p.id, !p.activo);
      }
      await this.cargar();
      this.cerrarCartel();
    } catch {
      this.errorCartel.set('No se pudo guardar el cambio. Probá de nuevo.');
    } finally {
      this.trabajando.set(false);
    }
  }
}