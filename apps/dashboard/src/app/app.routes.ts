import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./ui/pages/products-page/products-page.component').then(
        (m) => m.ProductsPageComponent,
      ),
  },
  { path: '**', redirectTo: '' },
];
