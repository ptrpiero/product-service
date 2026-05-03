import { Component, inject } from '@angular/core';
import { ButtonComponent } from '../../ui/atoms/button/button.component';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-auth-login',
  standalone: true,
  imports: [ButtonComponent],
  template: `
    <div class="min-h-screen bg-white flex items-center justify-center">
      <app-button variant="primary" (click)="login()">Sign in</app-button>
    </div>
  `,
})
export class AuthLoginComponent {
  private auth = inject(AuthService);
  login() { this.auth.login(); }
}
