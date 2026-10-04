import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe, TitleCasePipe, UpperCasePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toDataURL } from 'qrcode';
import { ComprasService } from '../../core/services/compras.service';
import { Pedido } from '../../core/models/compra';

// ENTRADA CON QR
// que necesito: la compra (por el codigo de la url) y convertir ese codigo en imagen QR
// como lo resuelvo: la base me da la compra (ver_pedido) y la libreria qrcode arma la imagen
// el PDF lo hace el navegador: imprimir → guardar como PDF
@Component({
  selector: 'app-entrada',
  imports: [CurrencyPipe, DatePipe, TitleCasePipe, UpperCasePipe, RouterLink],
  templateUrl: './entrada.html',
  styleUrl: './entrada.scss',
})
export class Entrada implements OnInit {
  private route = inject(ActivatedRoute);
  private comprasService = inject(ComprasService);

  pedido = signal<Pedido | null>(null);
  qr = signal('');   // la imagen del QR guardada como texto, va directo en el src del <img>
  error = signal('');

  // al entrar: leo el codigo de la url (/entrada/xxxx), busco la compra y armo el QR
  async ngOnInit() {
    const codigo = this.route.snapshot.paramMap.get('codigo') ?? '';
    try {
      this.pedido.set(await this.comprasService.verPedido(codigo));
      // el QR lleva un link a la pantalla de validacion (para el empleado del cine)
      // location.origin = la direccion de la app (localhost o la de firebase)
      this.qr.set(await toDataURL(location.origin + '/validar/' + codigo, { width: 220, margin: 1 }));
    } catch {
      this.error.set('No encontramos esa entrada.');
    }
  }

  // abre imprimir del navegador. ahi se elige "Guardar como PDF"
  imprimir() {
    window.print();
  }
}