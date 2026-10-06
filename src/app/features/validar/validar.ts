import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ComprasService } from '../../core/services/compras.service';
import { Pedido } from '../../core/models/compra';

// pantalla del empleado: valida entradas en la puerta
// entra por el link del QR (/validar/codigo) o escribiendo el codigo a mano
// lo que importa lo decide la base, aca solo se muestra y se manda
@Component({
  selector: 'app-validar',
  imports: [DatePipe],
  templateUrl: './validar.html',
  styleUrl: './validar.scss',
})
export class Validar implements OnInit {
  private route = inject(ActivatedRoute);
  private comprasService = inject(ComprasService);

  pedido = signal<Pedido | null>(null);
  codigoEscrito = signal('');
  error = signal('');
  mensaje = signal('');
  validando = signal(false);

  // si vino desde el QR, el codigo esta en la url
  async ngOnInit() {
    const codigo = this.route.snapshot.paramMap.get('codigo');
    if (codigo) {
      await this.buscar(codigo);
    }
  }

  escribirCodigo(e: Event) {
    this.codigoEscrito.set((e.target as HTMLInputElement).value);
  }

  // busca la entrada y la muestra, todavia no la valida
  async buscar(codigo: string) {
    this.error.set('');
    this.mensaje.set('');
    this.pedido.set(null);
    try {
      this.pedido.set(await this.comprasService.verPedido(codigo.trim()));
    } catch {
      this.error.set('No existe una entrada con ese código.');
    }
  }

  // es para hoy?
  esDeHoy() {
    const p = this.pedido();
    if (!p) return false;
    return new Date(p.inicio).toDateString() === new Date().toDateString();
  }

  // la base la marca como usada, si algo no da devuelve el motivo
  async dejarPasar() {
    const p = this.pedido();
    if (!p) return;
    this.validando.set(true);
    this.error.set('');
    try {
      this.pedido.set(await this.comprasService.validar(p.codigo));
      this.mensaje.set('Entrada validada. Puede pasar.');
    } catch (e: any) {
      this.error.set(e.message ?? 'No se pudo validar la entrada.');
    } finally {
      this.validando.set(false);
    }
  }
}