import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

const TOKEN_KEY = 'manager_token';

function readToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);
  readonly token = signal<string | null>(readToken());

  setToken(token: string): void {
    this.token.set(token);
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {}
  }

  isLoggedIn(): boolean {
    const token = this.token();
    if (!token) {
      return false;
    }
    const expiry = this.expiry(token);
    return expiry === null || expiry * 1000 > Date.now();
  }

  logout(): void {
    this.token.set(null);
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {}
    this.router.navigate(['/admin/login']);
  }

  private expiry(token: string): number | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return typeof payload.exp === 'number' ? payload.exp : null;
    } catch {
      return null;
    }
  }
}
