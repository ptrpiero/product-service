import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./ui/pages/products-page/products-page.component').then(
        (m) => m.ProductsPageComponent,
      ),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./core/auth/auth-login.component').then(
        (m) => m.AuthLoginComponent,
      ),
  },
  {
    path: 'callback',
    loadComponent: () =>
      import('./core/auth/auth-callback.component').then(
        (m) => m.AuthCallbackComponent,
      ),
  },
  { path: '**', redirectTo: '' },
];
