import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonComponent } from './ui/atoms/button/button.component';
import { AuthService } from './core/auth/auth.service';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ButtonComponent],
  template: `
    <div class="min-h-screen bg-white">
      <header class="border-b border-zinc-100 px-8 h-14 flex items-center gap-2.5">
        <div class="w-4 h-4 bg-zinc-900 rounded-sm flex-shrink-0"></div>
        <span class="text-sm font-semibold text-zinc-900 tracking-tight">Dashboard</span>
        @if (hasCognito) {
          <div class="ml-auto">
            <app-button variant="ghost" (click)="logout()">Sign out</app-button>
          </div>
        }
      </header>
      <main class="px-8 py-8">
        <router-outlet />
      </main>
    </div>
  `,
})
export class AppComponent {
  private auth = inject(AuthService);
  protected readonly hasCognito = environment.cognito !== null;
  logout() { this.auth.logout(); }
}
