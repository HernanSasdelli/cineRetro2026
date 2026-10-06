import { AbstractControl, ValidationErrors } from '@angular/forms';

// validador propio: las dos contraseñas tienen que ser iguales
// va en el grupo entero porque compara dos campos
export function clavesIguales(g: AbstractControl): ValidationErrors | null {
  const clave = g.get('password')?.value;
  const repetir = g.get('password2')?.value;
  if (!repetir) return null;   // de eso se encarga required
  return clave === repetir ? null : { clavesDistintas: true };
}