import { Component, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Producto } from '../../../core/models/candy';

// tarjeta de un producto del candy
// el padre le pasa el producto y la cantidad (input) y la tarjeta le avisa cuando tocan + o - (output)
// sin botones sirve para mostrar nomas, como en la cartelera
@Component({
  selector: 'app-tarjeta-producto',
  imports: [CurrencyPipe],
  templateUrl: './tarjeta-producto.html',
  styleUrl: './tarjeta-producto.scss',
})
export class TarjetaProducto {
  producto = input.required<Producto>();
  cantidad = input(0);
  conBotones = input(true);
  puedeSumar = input(true);

  sumar = output<void>();
  restar = output<void>();
}