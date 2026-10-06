import { Routes } from '@angular/router';
import { cambiosGuard } from '../../core/guards/cambios.guard';

// todo esto ya esta protegido por el canMatch de /admin en app.routes.ts
// y se descarga solo si sos admin (lazy loading)
export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./admin-layout/admin-layout').then(m => m.AdminLayout),
    // las hijas se muestran adentro del <router-outlet> del layout
    children: [
      { path: '', redirectTo: 'peliculas', pathMatch: 'full' },
      {
        path: 'peliculas',
        loadComponent: () => import('./panel/panel').then(m => m.Panel),
      },
      {
        path: 'funciones',
        loadComponent: () => import('./funciones-lista/funciones-lista').then(m => m.FuncionesLista),
      },
      {
        // solo mira, no se toca nada desde aca
        path: 'log',
        loadComponent: () => import('./log/log').then(m => m.Log),
      },          
      
      {
        // solo mira, no hay form, por eso no lleva canDeactivate
        path: 'reportes',
        loadComponent: () => import('./reportes/reportes').then(m => m.Reportes),
      },
      
      {
        // va antes que peliculas/:id, si no "nueva" se toma como un id
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
      {
        path: 'funciones/nueva',
        canDeactivate: [cambiosGuard],
        loadComponent: () => import('./funcion-form/funcion-form').then(m => m.FuncionForm),
      },
            {
        path: 'precios',
        canDeactivate: [cambiosGuard],
        loadComponent: () => import('./precios/precios').then(m => m.Precios),
      },

       {
        path: 'cupones',
        canDeactivate: [cambiosGuard],
        loadComponent: () => import('./cupones/cupones').then(m => m.Cupones),
      },
            {
        path: 'candy',
        canDeactivate: [cambiosGuard],
        loadComponent: () => import('./candy/candy').then(m => m.Candy),
      },

            {
        path: 'cupones/nuevo',
        canDeactivate: [cambiosGuard],
        loadComponent: () => import('./cupon-form/cupon-form').then(m => m.CuponForm),
      },
      {
        path: 'candy/nuevo',
        canDeactivate: [cambiosGuard],
        loadComponent: () => import('./candy-form/candy-form').then(m => m.CandyForm),
      },
    ],
  },
];