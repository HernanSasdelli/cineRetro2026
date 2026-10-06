import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CuponesService } from '../../../core/services/cupones.service';
import { Cupon } from '../../../core/models/compra';
import { ConCambios } from '../../../core/guards/cambios.guard';

// pestaña cupones del admin
// arriba la tabla para cambiar el porcentaje y activar o desactivar
// abajo el form para crear uno nuevo
// el descuento lo aplica la base sola al comprar, aca solo se configura
@Component({
  selector: 'app-cupones',
  imports: [RouterLink],
  templateUrl: './cupones.html',
  styleUrl: './cupones.scss',
})
export class Cupones implements OnInit, ConCambios {
  //private fb = inject(FormBuilder); al form
  private cuponesService = inject(CuponesService);

  cupones = signal<Cupon[]>([]);
  error = signal('');
  mensaje = signal('');
  private cambiado = false;   // escribio un porcentaje en la tabla y no lo guardo

  /*form = this.fb.group({ al form
    nombre: ['', Validators.required],
    porcentaje: [10, [Validators.required, Validators.min(1), Validators.max(100)]],
    solo_primera_compra: [false],
    edad_minima: [null as number | null, [Validators.min(1), Validators.max(120)]],
  });*/

  async ngOnInit() {
    await this.cargar();
  }

  // trae la lista de la base
  private async cargar() {
    try {
      this.cupones.set(await this.cuponesService.listar());
    } catch {
      this.error.set('No se pudieron cargar los cupones.');
    }
  }

  // lo pregunta el cambiosGuard al salir
  tieneCambios() {
    //return this.cambiado || this.form.dirty; ya no ahy form aca
      return this.cambiado;
  }

  // texto de a quien le toca el cupon
  aplicaA(c: Cupon) {
    if (c.solo_primera_compra && c.edad_minima) return 'Primera compra, mayores de ' + c.edad_minima;
    if (c.solo_primera_compra) return 'Primera compra';
    if (c.edad_minima) return 'Mayores de ' + c.edad_minima;
    return 'Todos los registrados';
  }

  // escribe un porcentaje en la tabla, lo anoto en el cupon pero todavia no va a la base
  escribirPorcentaje(c: Cupon, e: Event) {
    c.porcentaje = Number((e.target as HTMLInputElement).value);
    this.cambiado = true;
    this.mensaje.set('');
  }

  async guardarPorcentaje(c: Cupon) {
    if (!(c.porcentaje >= 1 && c.porcentaje <= 100)) {
      this.error.set('El porcentaje tiene que ser entre 1 y 100.');
      return;
    }
    this.error.set('');
    try {
      await this.cuponesService.cambiarPorcentaje(c.id, c.porcentaje);
      this.cambiado = false;
      this.mensaje.set('Se guardó ' + c.nombre + ' con ' + c.porcentaje + '%.');
    } catch {
      this.error.set('No se pudo guardar el cupón. Probá de nuevo.');
    }
  }

  async cambiarActivo(c: Cupon) {
    this.error.set('');
    try {
      await this.cuponesService.cambiarActivo(c.id, !c.activo);
      await this.cargar();   // traigo la lista de nuevo con el cambio
    } catch {
      this.error.set('No se pudo cambiar el cupón. Probá de nuevo.');
    }
  }


}