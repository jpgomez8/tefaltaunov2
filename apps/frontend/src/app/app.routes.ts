import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'inicio',
    loadComponent: () => import('./features/home/home-page').then((m) => m.HomePage),
  },
  {
    path: 'estado',
    pathMatch: 'full',
    loadComponent: () => import('./features/health/health-page').then((m) => m.HealthPage),
  },
  {
    path: 'iniciar-sesion',
    loadComponent: () => import('./features/auth/auth-page').then((m) => m.AuthPage),
  },
  {
    path: 'registro',
    data: { register: true },
    loadComponent: () => import('./features/auth/auth-page').then((m) => m.AuthPage),
  },
  { path: '', pathMatch: 'full', redirectTo: 'inicio' },
  { path: '**', redirectTo: 'inicio' },
];
