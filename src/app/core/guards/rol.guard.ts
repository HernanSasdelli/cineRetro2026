import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Rol } from '../models/perfil';

// deja pasar solo si el rol del usuario esta en data.roles de la ruta
export const rolGuard: CanMatchFn = async (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  await auth.listo;
  const permitidos = (route.data?.['roles'] ?? []) as Rol[];
  const rol = auth.rol();

  return rol && permitidos.includes(rol) ? true : router.createUrlTree(['/cartelera']);
};