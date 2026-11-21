import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { I18nService } from '../core/i18n.service';
import { LangSwitchComponent } from '../core/lang-switch.component';
import { CartService } from '../core/cart.service';
import { FavoritesService } from '../core/favorites.service';

@Component({
  selector: 'app-public-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LangSwitchComponent],
  template: `
    <header class="site-header">
      <div class="container header-inner">
        <a routerLink="/" class="brand"><span class="brand-mark">&#10048;</span> {{ i18n.t('brand.store') }}</a>
        <nav class="nav">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">{{ i18n.t('nav.home') }}</a>
          <a routerLink="/favorites" routerLinkActive="active">
            {{ i18n.t('nav.favorites') }}
            @if (favorites.count() > 0) {
              <span class="count-badge">{{ favorites.count() }}</span>
            }
          </a>
          <a routerLink="/cart" routerLinkActive="active">
            {{ i18n.t('nav.cart') }}
            @if (cart.count() > 0) {
              <span class="count-badge">{{ cart.count() }}</span>
            }
          </a>
          <app-lang-switch />
        </nav>
      </div>
    </header>

    <main class="container page">
      <router-outlet />
    </main>

    <footer class="site-footer">
      <div class="container footer-inner">
        <span>{{ i18n.t('footer.note') }}</span>
        <a routerLink="/admin/login" class="footer-link">{{ i18n.t('footer.manager') }}</a>
      </div>
    </footer>
  `,
})
export class PublicLayoutComponent {
  i18n = inject(I18nService);
  cart = inject(CartService);
  favorites = inject(FavoritesService);
}
