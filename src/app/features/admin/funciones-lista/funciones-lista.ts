import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FuncionesService } from '../../../core/services/funciones.service';
import { FuncionConDatos } from '../../../core/models/funcion';

@Component({
  selector: 'app-funciones-lista',
  imports: [RouterLink, DatePipe, CurrencyPipe, TitleCasePipe],
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
}