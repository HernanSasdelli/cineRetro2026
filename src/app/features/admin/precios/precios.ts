import { Component, OnInit, inject, signal } from '@angular/core';
import { FuncionesService } from '../../../core/services/funciones.service';
import { Formato, Precio } from '../../../core/models/funcion';
import { ConCambios } from '../../../core/guards/cambios.guard';

// PRECIOS DE LAS ENTRADAS (admin)
// que necesito: los 4 precios de la tabla precios y poder cambiarlos
// como lo resuelvo: los cargo en una señal, al escribir cambio la señal,
// y con "Guardar" recorro la lista y actualizo cada uno en la base
// es el precio que se SUGIERE al cargar funciones nuevas (las ya cargadas no cambian)
@Component({
  selector: 'app-precios',
  imports: [],
  templateUrl: './precios.html',
  styleUrl: './precios.scss',
})
export class Precios implements OnInit, ConCambios {
  private funcionesService = inject(FuncionesService);

  precios = signal<Precio[]>([]);
  error = signal('');
  mensaje = signal('');
  guardando = signal(false);
  private cambiado = false;   // para el guard: true si escribio algo y no guardo

  // al entrar traigo los 4 precios
  async ngOnInit() {
    try {
      this.precios.set(await this.funcionesService.precios());
    } catch {
      this.error.set('No se pudieron cargar los precios.');
    }
  }

  // escribe en una cajita: cambio ese precio en MI lista (todavia no en la base)
  // armo una lista nueva igual a la vieja pero con ese precio cambiado
  cambiar(formato: Formato, e: Event) {
    const valor = Number((e.target as HTMLInputElement).value);
    const nueva: Precio[] = [];
    for (const p of this.precios()) {
      if (p.formato === formato) {
        nueva.push({ formato: p.formato, precio: valor });
      } else {
        nueva.push(p);
      }
    }
    this.precios.set(nueva);
    this.cambiado = true;
    this.mensaje.set('');
  }

  // la llama el cambiosGuard antes de salir
  tieneCambios() {
    return this.cambiado;
  }

  // reviso que ninguno quede en 0 y guardo los 4 en la base
  async guardar() {
    for (const p of this.precios()) {
      if (!(p.precio > 0)) {
        this.error.set('Todos los precios tienen que ser mayores a 0.');
        return;
      }
    }

    this.error.set('');
    this.guardando.set(true);
    try {
      for (const p of this.precios()) {
        await this.funcionesService.guardarPrecio(p.formato, p.precio);
      }
      this.cambiado = false;
      this.mensaje.set('Precios guardados.');
    } catch {
      this.error.set('No se pudieron guardar los precios.');
    } finally {
      this.guardando.set(false);
    }
  }
}