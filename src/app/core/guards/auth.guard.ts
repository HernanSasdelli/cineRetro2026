import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async () => {
  // inject siempre antes del await
  const auth = inject(AuthService);
  const router = inject(Router);

  await auth.listo;
  return auth.logueado() ? true : router.createUrlTree(['/login']);
};
