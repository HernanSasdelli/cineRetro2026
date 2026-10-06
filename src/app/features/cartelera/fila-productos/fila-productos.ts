import { Component, input, signal } from '@angular/core';
import { Producto } from '../../../core/models/candy';
import { TarjetaProducto } from '../../../shared/components/tarjeta-producto/tarjeta-producto';

// fila del candy de a 4 con flechas que dan la vuelta, igual que la de peliculas
// las tarjetas van sin botones, en la cartelera solo se muestran
@Component({
  selector: 'app-fila-productos',
  imports: [TarjetaProducto],
  templateUrl: './fila-productos.html',
  styleUrl: './fila-productos.scss',
})
export class FilaProductos {
  productos = input.required<Producto[]>();
  inicio = signal(0);   // desde cual arranca a mostrar
  private porVez = 4;

  // si hay mas de 4 aparecen las flechas
  hayMas() {
    return this.productos().length > this.porVez;
  }

  // los 4 que se ven, empezando por inicio. el % hace que despues del ultimo siga el primero
  visibles() {
    const total = this.productos().length;
    if (!this.hayMas()) return this.productos();
    const lista: Producto[] = [];
    for (let i = 0; i < this.porVez; i++) {
      lista.push(this.productos()[(this.inicio() + i) % total]);
    }
    return lista;
  }

  siguiente() {
    const total = this.productos().length;
    this.inicio.set((this.inicio() + 1) % total);
  }

  anterior() {
    const total = this.productos().length;
    this.inicio.set((this.inicio() - 1 + total) % total);
  }
}