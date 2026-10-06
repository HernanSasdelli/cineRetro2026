import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { cambiosGuard } from './core/guards/cambios.guard';
import { rolGuard } from './core/guards/rol.guard';
import { compraGuard } from './core/guards/compra.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'cartelera', pathMatch: 'full' },
  {
    path: 'cartelera',
    loadComponent: () => import('./features/cartelera/cartelera').then(m => m.Cartelera),
  },
  {
    path: 'pelicula/:id',
    loadComponent: () =>
      import('./features/pelicula-detalle/pelicula-detalle').then(m => m.PeliculaDetalle),
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.Login),
  },
  {
    path: 'registro',
    loadComponent: () => import('./features/auth/registro/registro').then(m => m.Registro),
  },
  {
    path: 'perfil',
    canActivate: [authGuard],
    loadComponent: () => import('./features/perfil/perfil').then(m => m.Perfil),
  },
  {
    path: 'admin',
    canMatch: [authGuard, rolGuard],
    data: { roles: ['admin'] },
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
  },
  {
    // comprar NO pide login: se puede comprar sin cuenta con el mail
    // compraGuard: compran el anonimo y el cliente, el personal no
    // canDeactivate: si eligio butacas y se va sin comprar, pregunta
    path: 'compra/:funcionId',
    canActivate: [compraGuard],
    canDeactivate: [cambiosGuard],
    loadComponent: () => import('./features/compra/compra').then(m => m.Compra),
  },

  {
    // publica: la entrada se ve con el codigo, aunque haya comprado sin cuenta
    path: 'entrada/:codigo',
    loadComponent: () => import('./features/entrada/entrada').then(m => m.Entrada),
  },

  {
    // solo clientes: el admin no compra, no tiene peliculas
    path: 'mis-peliculas',
    canMatch: [authGuard, rolGuard],
    data: { roles: ['cliente'] },
    canDeactivate: [cambiosGuard],
    loadComponent: () => import('./features/mis-peliculas/mis-peliculas').then(m => m.MisPeliculas),
  },
    {
    // personal del cine: empleados y admin. a mano o desde el QR
    path: 'validar',
    canMatch: [authGuard, rolGuard],
    data: { roles: ['empleado', 'admin'] },
    loadComponent: () => import('./features/validar/validar').then(m => m.Validar),
  },
  {
    path: 'validar/:codigo',
    canMatch: [authGuard, rolGuard],
    data: { roles: ['empleado', 'admin'] },
    loadComponent: () => import('./features/validar/validar').then(m => m.Validar),
  },

    {
    path: 'recuperar',
    loadComponent: () => import('./features/auth/recuperar/recuperar').then(m => m.Recuperar),
  },
  {
    // llega desde el link del mail
    path: 'nueva-clave',
    loadComponent: () => import('./features/auth/nueva-clave/nueva-clave').then(m => m.NuevaClave),
  },


  { path: '**', redirectTo: 'cartelera' },
];