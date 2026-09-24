import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./panel/panel').then(m => m.Panel) },
  {
    path: 'peliculas/nueva',
    loadComponent: () => import('./pelicula-form/pelicula-form').then(m => m.PeliculaForm),
  },
  {
    // mismo form, pero con id = editar
    path: 'peliculas/:id',
    loadComponent: () => import('./pelicula-form/pelicula-form').then(m => m.PeliculaForm),
  },
];