import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const compraGuard: CanActivateFn = async () => {
  // inject siempre antes del await
  const auth = inject(AuthService);
  const router = inject(Router);

  await auth.listo;
  const rol = auth.rol();
  // compra el anonimo y el cliente. el empleado y el admin no, trabajan aca
  return rol === null || rol === 'cliente' ? true : router.createUrlTree(['/cartelera']);
};