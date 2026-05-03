import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="min-h-screen bg-gray-50">
      <header class="bg-white border-b border-gray-200 px-6 py-4">
        <h1 class="text-xl font-semibold text-gray-900 tracking-tight">Product Dashboard</h1>
      </header>
      <main class="p-6">
        <router-outlet />
      </main>
    </div>
  `,
})
export class AppComponent {}
