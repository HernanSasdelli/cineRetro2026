import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { LogService } from '../../../core/services/log.service';
import { LogItem } from '../../../core/models/log';

// necesito: saber quien hizo cada cosa y cuando
// uso: triggers en la base que escriben en la tabla log, y una funcion que la lee
// la pantalla solo muestra, no tiene ningun boton que cambie nada
@Component({
  selector: 'app-log',
  imports: [DatePipe],
  templateUrl: './log.html',
  styleUrl: './log.scss',
})
export class Log implements OnInit {
  private logService = inject(LogService);

  lineas = signal<LogItem[]>([]);
  cargando = signal(true);
  error = signal('');

  async ngOnInit() {
    try {
      this.lineas.set(await this.logService.ver());
    } catch {
      this.error.set('No se pudo cargar el log.');
    } finally {
      this.cargando.set(false);
    }
  }
}