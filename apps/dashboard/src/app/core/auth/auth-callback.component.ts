import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  template: `<div class="flex h-screen items-center justify-center text-sm text-zinc-400">Signing in…</div>`,
})
export class AuthCallbackComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);

  async ngOnInit() {
    await this.auth.handleCallback();
    await this.router.navigate(['/']);
  }
}
