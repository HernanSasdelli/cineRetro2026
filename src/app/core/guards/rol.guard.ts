import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Rol } from '../models/perfil';

export const rolGuard: CanActivateFn = async (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  await auth.listo;
  const permitidos = (route.data['roles'] ?? []) as Rol[];
  const rol = auth.rol();

  return rol && permitidos.includes(rol) ? true : router.createUrlTree(['/cartelera']);
};
