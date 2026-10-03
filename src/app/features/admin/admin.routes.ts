import { Routes } from '@angular/router';
import { cambiosGuard } from '../../core/guards/cambios.guard';

export const ADMIN_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./panel/panel').then(m => m.Panel) },
  {
    path: 'peliculas/nueva',
    canDeactivate: [cambiosGuard],
    loadComponent: () => import('./pelicula-form/pelicula-form').then(m => m.PeliculaForm),
  },
  {
    // mismo form, pero con id = editar
    path: 'peliculas/:id',
    canDeactivate: [cambiosGuard],
    loadComponent: () => import('./pelicula-form/pelicula-form').then(m => m.PeliculaForm),
  },
];