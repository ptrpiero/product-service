import { Injectable } from '@angular/core';
import { UserManager, UserManagerSettings } from 'oidc-client-ts';
import { environment } from '../../../environments/environment';

function buildUserManagerSettings(): UserManagerSettings | null {
  const c = environment.cognito;
  if (!c) return null;

  const authority = `https://cognito-idp.${c.region}.amazonaws.com/${c.userPoolId}`;
  const cognitoLogoutUrl =
    `https://${c.domain}.auth.${c.region}.amazoncognito.com/logout` +
    `?client_id=${c.userPoolClientId}` +
    `&logout_uri=${encodeURIComponent(window.location.origin)}`;

  return {
    authority,
    client_id: c.userPoolClientId,
    redirect_uri: `${window.location.origin}/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    post_logout_redirect_uri: window.location.origin,
    metadata: {
      issuer: authority,
      authorization_endpoint: `https://${c.domain}.auth.${c.region}.amazoncognito.com/oauth2/authorize`,
      token_endpoint: `https://${c.domain}.auth.${c.region}.amazoncognito.com/oauth2/token`,
      jwks_uri: `${authority}/.well-known/jwks.json`,
      end_session_endpoint: cognitoLogoutUrl,
      userinfo_endpoint: `https://${c.domain}.auth.${c.region}.amazoncognito.com/oauth2/userInfo`,
    },
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private manager: UserManager | null = null;

  constructor() {
    const settings = buildUserManagerSettings();
    if (settings) {
      this.manager = new UserManager(settings);
    }
  }

  async isAuthenticated(): Promise<boolean> {
    if (!this.manager) return true;
    const user = await this.manager.getUser();
    return !!user && !user.expired;
  }

  async login(): Promise<void> {
    if (!this.manager) return;
    await this.manager.signinRedirect();
  }

  async handleCallback(): Promise<void> {
    if (!this.manager) return;
    await this.manager.signinRedirectCallback();
  }

  async logout(): Promise<void> {
    if (!this.manager) return;
    await this.manager.signoutRedirect();
  }

  async getAccessToken(): Promise<string | null> {
    if (!this.manager) return null;
    const user = await this.manager.getUser();
    return user?.access_token ?? null;
  }
}
