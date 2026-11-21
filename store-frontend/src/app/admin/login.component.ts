import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { I18nService } from '../core/i18n.service';
import { LangSwitchComponent } from '../core/lang-switch.component';
import { errorMessage } from '../core/utils';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, LangSwitchComponent],
  template: `
    <div class="login-page">
      <div class="login-lang"><app-lang-switch /></div>
      <form class="card login-card" [formGroup]="form" (ngSubmit)="submit()">
        <div class="login-logo">&#10048;</div>
        <h1>{{ i18n.t('login.title') }}</h1>
        <p class="muted center">{{ i18n.t('login.subtitle') }}</p>

        <div class="form-group">
          <label for="username">{{ i18n.t('login.username') }}</label>
          <input id="username" type="text" formControlName="username" autocomplete="username" />
        </div>

        <div class="form-group">
          <label for="password">{{ i18n.t('login.password') }}</label>
          <input id="password" type="password" formControlName="password" autocomplete="current-password" />
        </div>

        @if (error()) {
          <div class="alert alert-error">{{ error() }}</div>
        }

        <button type="submit" class="btn btn-primary btn-block" [disabled]="submitting()">
          {{ submitting() ? i18n.t('login.signingIn') : i18n.t('login.signIn') }}
        </button>

        <a routerLink="/" class="btn btn-ghost btn-block">{{ i18n.t('checkout.back') }}</a>
      </form>
    </div>
  `,
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  i18n = inject(I18nService);
  private auth = inject(AuthService);
  private router = inject(Router);

  submitting = signal(false);
  error = signal('');

  form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/admin']);
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.error.set(this.i18n.t('login.required'));
      return;
    }
    const { username, password } = this.form.getRawValue();

    this.submitting.set(true);
    this.error.set('');
    this.api.login(username.trim(), password).subscribe({
      next: (result) => {
        this.auth.setToken(result.token);
        this.router.navigate(['/admin']);
      },
      error: (error) => {
        this.error.set(errorMessage(error));
        this.submitting.set(false);
      },
    });
  }
}
