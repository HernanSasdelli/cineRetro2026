import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router} from '@angular/router';
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
  private router = inject(Router);

  pedido = signal<Pedido | null>(null);
  codigoEscrito = signal('');
  error = signal('');
  mensaje = signal('');
  validando = signal(false);
  mensajeCandy = signal('');

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

    // si pegan o escanean el link entero del QR, me quedo con lo que va despues de /validar/
  private limpiarCodigo(texto: string) {
    const partes = texto.trim().split('/validar/');
    return partes[partes.length - 1];
  }
  // busca la entrada y la muestra, todavia no la valida
  async buscar(codigo: string) {
    this.error.set('');
    this.mensaje.set('');
    this.mensajeCandy.set('');
    this.pedido.set(null);
    try {
      const texto = this.limpiarCodigo(codigo);
      // 5 o 6 caracteres es el codigo corto, si no es el largo del QR
      if (texto.length <= 6) {
        this.pedido.set(await this.comprasService.verPedidoCorto(texto));
      } else {
        this.pedido.set(await this.comprasService.verPedido(texto));
      }
    } catch {
      this.error.set('No existe una entrada con ese código.');
    }
  }

  // es para hoy?
  // esDeHoy() {
  //   const p = this.pedido();
  //   if (!p) return false;
  //   return new Date(p.inicio).toDateString() === new Date().toDateString();
  // }

  // se puede entrar desde 1 hora antes hasta que termina la peli
  // temprano, terminada u ok. lo que decide es la base, esto es para mostrar el motivo
  horario() {
    const p = this.pedido();
    if (!p) return 'ok';
    const inicio = new Date(p.inicio).getTime();   // en milisegundos
    const ahora = Date.now();
    const antes = 15 * 60 * 1000;   // se entra 15 minutos antes, la anterior ya termino y se limpio
    const fin = inicio + p.duracion_min * 60 * 1000;
    if (ahora < inicio - antes) return 'temprano';
    if (ahora > fin) return 'terminada';
    return 'ok';
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

    // deja la pantalla limpia para la proxima entrada
  // si vino del QR, vuelvo a /validar asi no queda el codigo viejo en la url
  otraEntrada() {
    this.pedido.set(null);
    this.codigoEscrito.set('');
    this.error.set('');
    this.mensaje.set('');

    this.mensajeCandy.set('');
    this.router.navigate(['/validar']);
    
  }

    // entregar el candy en el mostrador, va aparte de la entrada
  async entregarCandy() {
    const p = this.pedido();
    if (!p) return;
    this.validando.set(true);
    this.error.set('');
    try {
      this.pedido.set(await this.comprasService.entregarCandy(p.codigo));
      this.mensajeCandy.set('Candy entregado.');
    } catch (e: any) {
      this.error.set(e.message ?? 'No se pudo entregar el candy.');
    } finally {
      this.validando.set(false);
    }
  }
}