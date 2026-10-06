import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe, UpperCasePipe } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { ComprasService } from '../../core/services/compras.service';
import { Movimiento } from '../../core/models/compra';

// mis datos, mi credito y mis puntos con el historial
@Component({
  selector: 'app-perfil',
  imports: [DatePipe, UpperCasePipe, CurrencyPipe],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss',
})
export class Perfil implements OnInit {
  auth = inject(AuthService);
  private comprasService = inject(ComprasService);

  movimientos = signal<Movimiento[]>([]);

  async ngOnInit() {
    try {
      this.movimientos.set(await this.comprasService.movimientos());
    } catch {
      // si falla, el perfil se ve igual sin el historial
    }
  }

  // el saldo es la suma de los movimientos de ese tipo
  saldo(tipo: 'credito' | 'puntos') {
    let suma = 0;
    for (const m of this.movimientos()) {
      if (m.tipo === tipo) suma += m.monto;
    }
    return suma;
  }
}