import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: '',
    loadComponent: () => import('./layouts/public-layout/public-layout').then(m => m.PublicLayoutComponent),
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login').then(m => m.LoginComponent)
      }
    ]
  },
  {
    path: '',
    loadComponent: () => import('./layouts/admin-layout/admin-layout').then(m => m.AdminLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then(m => m.DashboardComponent)
      },
      {
        path: 'captaciones',
        loadComponent: () => import('./features/captaciones/list/list').then(m => m.CaptacionesListComponent)
      },
      {
        path: 'captaciones/create',
        loadComponent: () => import('./features/captaciones/form/form').then(m => m.CaptacionFormComponent)
      },
      {
        path: 'captaciones/edit/:id',
        loadComponent: () => import('./features/captaciones/form/form').then(m => m.CaptacionFormComponent)
      },
      {
        path: 'captaciones/quick',
        loadComponent: () => import('./features/captaciones/quick/quick').then(m => m.QuickCaptacionComponent)
      },
      {
        path: 'sales',
        loadComponent: () => import('./features/sales/sales').then(m => m.SalesComponent)
      },
      {
        path: 'timeline',
        loadComponent: () => import('./features/followups/timeline/timeline').then(m => m.TimelineComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/auth/profile/profile').then(m => m.ProfileComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
