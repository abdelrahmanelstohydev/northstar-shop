import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { CartService } from '../core/cart.service';
import { FavoritesService } from '../core/favorites.service';
import { I18nService } from '../core/i18n.service';
import { Item } from '../core/models';
import { PricePipe } from '../core/price.pipe';
import { errorMessage } from '../core/utils';

@Component({
  selector: 'app-item-details',
  imports: [RouterLink, PricePipe],
  template: `
    <a routerLink="/" class="back-link">{{ i18n.isRtl() ? '→' : '←' }} {{ i18n.t('item.back') }}</a>

    @if (loading()) {
      <p class="muted center">{{ i18n.t('common.loading') }}</p>
    } @else if (error()) {
      <div class="alert alert-error">{{ error() }}</div>
    } @else if (item(); as product) {
      <div class="card detail">
        <div class="detail-image">
          @if (product.image) {
            <img [src]="api.imageUrl(product.image)" [alt]="i18n.loc(product.name)" />
          } @else {
            <div class="placeholder large">{{ i18n.loc(product.name).charAt(0) }}</div>
          }
        </div>
        <div class="detail-info">
          <h1>{{ i18n.loc(product.name) }}</h1>
          <div class="detail-price">{{ product.price | price }}</div>
          <p class="detail-description">{{ i18n.loc(product.description) }}</p>

          <div class="row">
            <div class="qty">
              <button type="button" (click)="change(-1)" [attr.aria-label]="i18n.t('item.decrease')">&minus;</button>
              <span>{{ quantity() }}</span>
              <button type="button" (click)="change(1)" [attr.aria-label]="i18n.t('item.increase')">+</button>
            </div>
            <button type="button" class="btn btn-primary grow" (click)="addToCart()">
              {{ added() ? i18n.t('item.addedToCart') : i18n.t('item.add') }}
            </button>
            <button
              type="button"
              class="btn btn-outline icon-btn"
              [class.active]="favorites.has(product._id)"
              (click)="favorites.toggle(product._id)"
              [attr.aria-label]="i18n.t('item.favToggle')"
            >
              {{ favorites.has(product._id) ? '♥' : '♡' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ItemDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  api = inject(ApiService);
  i18n = inject(I18nService);
  cart = inject(CartService);
  favorites = inject(FavoritesService);

  item = signal<Item | null>(null);
  loading = signal(true);
  error = signal('');
  quantity = signal(1);
  added = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.api.getItem(id).subscribe({
      next: (item) => {
        this.item.set(item);
        this.loading.set(false);
      },
      error: (error) => {
        const notFound = error instanceof HttpErrorResponse && (error.status === 404 || error.status === 400);
        this.error.set(notFound ? this.i18n.t('err.itemNotFound') : errorMessage(error));
        this.loading.set(false);
      },
    });
  }

  change(delta: number): void {
    this.quantity.set(Math.min(99, Math.max(1, this.quantity() + delta)));
  }

  addToCart(): void {
    const item = this.item();
    if (!item) {
      return;
    }
    this.cart.add(item._id, this.quantity());
    this.added.set(true);
    setTimeout(() => this.added.set(false), 1500);
  }
}
