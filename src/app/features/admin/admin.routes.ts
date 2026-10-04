import { Routes } from '@angular/router';
import { cambiosGuard } from '../../core/guards/cambios.guard';


//aca estan todas protegidas, esta parte del codigo se descarga solo si sos admin. lazy loading
export const ADMIN_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./panel/panel').then(m => m.Panel) },
  {
    path: 'peliculas/nueva',
    canDeactivate: [cambiosGuard],
    loadComponent: () => import('./pelicula-form/pelicula-form').then(m => m.PeliculaForm),
  },
  {
  path: 'funciones/nueva',
  loadComponent: () => import('./funcion-form/funcion-form').then(m => m.FuncionForm),
  canDeactivate: [cambiosGuard],
},
  {
    // mismo form, pero con id = editar
    path: 'peliculas/:id',
    canDeactivate: [cambiosGuard],
    loadComponent: () => import('./pelicula-form/pelicula-form').then(m => m.PeliculaForm),
  },
];