import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FuncionesService } from '../../../core/services/funciones.service';
import { FuncionConDatos } from '../../../core/models/funcion';
import { Modal } from '../../../shared/components/modal/modal';

@Component({
  selector: 'app-funciones-lista',
  imports: [RouterLink, DatePipe, CurrencyPipe, TitleCasePipe, Modal],
  templateUrl: './funciones-lista.html',
  styleUrl: './funciones-lista.scss',
})
export class FuncionesLista implements OnInit {
  private funcionesService = inject(FuncionesService);
  funciones = signal<FuncionConDatos[]>([]);
  error = signal('');

  // al entrar traigo las funciones que todavia no empezaron
  async ngOnInit() {
    try {
      this.funciones.set(await this.funcionesService.proximas());
    } catch {
      this.error.set('No se pudieron cargar las funciones.');
    }
  }

    // ---------- ELIMINAR ----------
  aEliminar = signal<FuncionConDatos | null>(null);   // la que se quiere borrar (null = cartel cerrado)
  eliminando = signal(false);
  errorEliminar = signal('');

  // tocaron "Eliminar" en una fila: abro el cartel para confirmar
  pedirEliminar(f: FuncionConDatos) {
    this.errorEliminar.set('');
    this.aEliminar.set(f);
  }

  cerrarCartel() {
    this.aEliminar.set(null);
  }

  // confirmaron: le pido a la base que la borre
  // si tiene entradas vendidas la base no deja (23503) y lo aviso en el mismo cartel
  async confirmarEliminar() {
    const f = this.aEliminar();
    if (!f) return;
    this.eliminando.set(true);
    try {
      await this.funcionesService.eliminar(f.id);
      // la saco de la lista que ya tengo, sin volver a pedir todo a la base
      const nueva: FuncionConDatos[] = [];
      for (const x of this.funciones()) {
        if (x.id !== f.id) nueva.push(x);
      }
      this.funciones.set(nueva);
      this.aEliminar.set(null);
    } catch (e: any) {
      if (e.code === '23503') {
        this.errorEliminar.set('No se puede eliminar: ya tiene entradas vendidas.');
      } else {
        this.errorEliminar.set('No se pudo eliminar la función.');
      }
    } finally {
      this.eliminando.set(false);
    }
  }
}