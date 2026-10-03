import { CanDeactivateFn } from '@angular/router';

// cualquier pantalla con form que quiera avisar implementa esto
export interface ConCambios {
  tieneCambios(): boolean;
}

export const cambiosGuard: CanDeactivateFn<ConCambios> = (pantalla) =>
  !pantalla.tieneCambios() || confirm('Tenés cambios sin guardar. ¿Salir igual?');