import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { I18nService } from '../core/i18n.service';
import { LangSwitchComponent } from '../core/lang-switch.component';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LangSwitchComponent],
  template: `
    <div class="admin-shell">
      <aside class="sidebar">
        <a routerLink="/admin" class="brand"><span class="brand-mark">&#10048;</span> {{ i18n.t('admin.brand') }}</a>
        <nav class="side-nav">
          <a routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">{{ i18n.t('admin.dashboard') }}</a>
          <a routerLink="/admin/categories" routerLinkActive="active">{{ i18n.t('admin.categories') }}</a>
          <a routerLink="/admin/items" routerLinkActive="active">{{ i18n.t('admin.items') }}</a>
          <a routerLink="/admin/orders" routerLinkActive="active">{{ i18n.t('admin.orders') }}</a>
        </nav>
        <div class="side-footer">
          <a routerLink="/" class="side-link">{{ i18n.t('admin.viewShop') }}</a>
          <app-lang-switch />
          <button type="button" class="btn btn-outline btn-block" (click)="auth.logout()">{{ i18n.t('admin.logout') }}</button>
        </div>
      </aside>
      <section class="admin-main">
        <router-outlet />
      </section>
    </div>
  `,
})
export class AdminLayoutComponent {
  auth = inject(AuthService);
  i18n = inject(I18nService);
}
