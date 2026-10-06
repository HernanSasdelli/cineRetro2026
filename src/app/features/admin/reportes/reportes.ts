import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ReportesService } from '../../../core/services/reportes.service';
import { Reporte } from '../../../core/models/reporte';

// necesito: cuanto se facturo por dia y cuantas entradas se vendieron
// uso: una funcion de la base que hace el group by, aca solo lo muestro
// las barras son divs con el ancho atado a un porcentaje, no uso ninguna libreria
@Component({
  selector: 'app-reportes',
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './reportes.html',
  styleUrl: './reportes.scss',
})
export class Reportes implements OnInit {
  private reportesService = inject(ReportesService);

  reporte = signal<Reporte | null>(null);
  desde = signal('');
  hasta = signal('');
  cargando = signal(false);
  error = signal('');

  async ngOnInit() {
    // arranco mostrando el ultimo mes
    const hoy = new Date();
    const mesAtras = new Date();
    mesAtras.setDate(hoy.getDate() - 30);
    this.hasta.set(this.texto(hoy));
    this.desde.set(this.texto(mesAtras));
    await this.buscar();
  }

  // paso una fecha a yyyy-mm-dd, que es lo que espera el input type date
  // la armo con los pedazos y no con toISOString, que trabaja en UTC y me corre un dia
  private texto(d: Date) {
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + mes + '-' + dia;
  }

  escribirDesde(e: Event) {
    this.desde.set((e.target as HTMLInputElement).value);
  }

  escribirHasta(e: Event) {
    this.hasta.set((e.target as HTMLInputElement).value);
  }

  async buscar() {
    this.cargando.set(true);
    this.error.set('');
    try {
      this.reporte.set(await this.reportesService.ver(this.desde(), this.hasta()));
    } catch {
      this.error.set('No se pudo cargar el reporte.');
    } finally {
      this.cargando.set(false);
    }
  }

  // el dia que mas facturo, para que esa sea la barra mas larga
  maximo() {
    let max = 0;
    const r = this.reporte();
    if (!r) return 0;
    for (const d of r.dias) {
      if (d.total > max) max = d.total;
    }
    return max;
  }

  // cuanto mide la barra de un dia, en porcentaje
  ancho(total: number) {
    const max = this.maximo();
    if (max === 0) return 0;
    return (total * 100) / max;
  }

  // exportar a excel: armo un csv a mano y lo bajo, excel lo abre igual
  // separo con punto y coma porque en castellano la coma es el decimal
  descargar() {
    const r = this.reporte();
    if (!r) return;
    let texto = 'Fecha;Entradas;Facturacion\n';
    for (const d of r.dias) {
      texto += d.fecha + ';' + d.entradas + ';' + d.total + '\n';
    }
    // el Blob es el archivo armado en memoria, el link invisible es el que lo descarga
    const archivo = new Blob([texto], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(archivo);
    link.download = 'reporte-' + this.desde() + '-a-' + this.hasta() + '.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  }

  // exportar a pdf: la ventana de impresion del navegador deja guardar como pdf
  imprimir() {
    window.print();
  }
}