import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="min-h-screen bg-white">
      <header class="border-b border-zinc-100 px-8 h-14 flex items-center gap-2.5">
        <div class="w-4 h-4 bg-zinc-900 rounded-sm flex-shrink-0"></div>
        <span class="text-sm font-semibold text-zinc-900 tracking-tight">Dashboard</span>
      </header>
      <main class="px-8 py-8">
        <router-outlet />
      </main>
    </div>
  `,
})
export class AppComponent {}
