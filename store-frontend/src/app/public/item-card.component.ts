import { Component, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { CartService } from '../core/cart.service';
import { FavoritesService } from '../core/favorites.service';
import { I18nService } from '../core/i18n.service';
import { Item } from '../core/models';
import { PricePipe } from '../core/price.pipe';

@Component({
  selector: 'app-item-card',
  imports: [RouterLink, PricePipe],
  template: `
    <article class="card item-card">
      <a [routerLink]="['/items', item()._id]" class="item-image">
        @if (item().image) {
          <img [src]="api.imageUrl(item().image)" [alt]="i18n.loc(item().name)" loading="lazy" />
        } @else {
          <div class="placeholder">{{ i18n.loc(item().name).charAt(0) }}</div>
        }
      </a>
      <button
        type="button"
        class="fav-btn"
        [class.active]="favorites.has(item()._id)"
        (click)="favorites.toggle(item()._id)"
        [attr.aria-label]="i18n.t('item.favToggle')"
      >
        {{ favorites.has(item()._id) ? '♥' : '♡' }}
      </button>
      <div class="item-body">
        <a [routerLink]="['/items', item()._id]" class="item-name">{{ i18n.loc(item().name) }}</a>
        <div class="item-price">{{ item().price | price }}</div>
        <button type="button" class="btn btn-primary btn-block" (click)="add()">
          {{ added() ? i18n.t('item.added') : i18n.t('item.add') }}
        </button>
      </div>
    </article>
  `,
})
export class ItemCardComponent {
  item = input.required<Item>();
  api = inject(ApiService);
  i18n = inject(I18nService);
  favorites = inject(FavoritesService);
  cart = inject(CartService);
  added = signal(false);

  add(): void {
    this.cart.add(this.item()._id);
    this.added.set(true);
    setTimeout(() => this.added.set(false), 1200);
  }
}
