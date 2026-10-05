import { CanDeactivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { ConfirmacionService } from '../services/confirmacion.service';

// cualquier pantalla con form que quiera avisar implementa esto
export interface ConCambios {
  tieneCambios(): boolean;
}


// devuelve true cuando sale o una promesa que se cumple cuando el usuario elige
export const cambiosGuard: CanDeactivateFn<ConCambios> = (componente) => {
  if (!componente.tieneCambios()) {
    return true;   //sale sin preguntar
  }
  const confirmacion = inject(ConfirmacionService);
  return confirmacion.preguntar('Tenés cambios sin guardar. ¿Querés salir igual?');
};