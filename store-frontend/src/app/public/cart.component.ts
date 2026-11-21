import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { CartService } from '../core/cart.service';
import { I18nService } from '../core/i18n.service';
import { PricePipe } from '../core/price.pipe';
import { errorMessage } from '../core/utils';

@Component({
  selector: 'app-cart',
  imports: [RouterLink, PricePipe],
  template: `
    <h1 class="page-title">{{ i18n.t('cart.title') }}</h1>

    @if (error()) {
      <div class="alert alert-error">{{ error() }}</div>
    }

    @if (loading()) {
      <p class="muted center">{{ i18n.t('common.loading') }}</p>
    } @else if (cart.rows().length === 0) {
      <div class="card empty">
        <p>{{ i18n.t('cart.empty') }}</p>
        <a routerLink="/" class="btn btn-primary">{{ i18n.t('cart.start') }}</a>
      </div>
    } @else {
      <div class="two-col">
        <div class="card cart-list">
          @for (row of cart.rows(); track row.item._id) {
            <div class="cart-row">
              <a [routerLink]="['/items', row.item._id]" class="thumb">
                @if (row.item.image) {
                  <img [src]="api.imageUrl(row.item.image)" [alt]="i18n.loc(row.item.name)" />
                } @else {
                  <div class="placeholder">{{ i18n.loc(row.item.name).charAt(0) }}</div>
                }
              </a>
              <div class="cart-info">
                <a [routerLink]="['/items', row.item._id]" class="item-name">{{ i18n.loc(row.item.name) }}</a>
                <div class="muted">{{ row.item.price | price }}</div>
              </div>
              <div class="qty">
                <button type="button" (click)="cart.setQuantity(row.item._id, row.quantity - 1)" [attr.aria-label]="i18n.t('item.decrease')">&minus;</button>
                <span>{{ row.quantity }}</span>
                <button type="button" (click)="cart.setQuantity(row.item._id, row.quantity + 1)" [attr.aria-label]="i18n.t('item.increase')">+</button>
              </div>
              <div class="line-total">{{ row.item.price * row.quantity | price }}</div>
              <button type="button" class="remove-btn" (click)="cart.remove(row.item._id)" [attr.aria-label]="i18n.t('cart.removeItem')">&times;</button>
            </div>
          }
        </div>

        <aside class="card summary">
          <h2>{{ i18n.t('cart.summary') }}</h2>
          <div class="summary-row total">
            <span>{{ i18n.t('common.total') }}</span>
            <strong>{{ cart.total() | price }}</strong>
          </div>
          <p class="muted small">{{ i18n.t('cart.payNote') }}</p>
          <a routerLink="/checkout" class="btn btn-primary btn-block">{{ i18n.t('cart.checkout') }}</a>
          <a routerLink="/" class="btn btn-ghost btn-block">{{ i18n.t('cart.keep') }}</a>
        </aside>
      </div>
    }
  `,
})
export class CartComponent implements OnInit {
  api = inject(ApiService);
  i18n = inject(I18nService);
  cart = inject(CartService);

  loading = signal(true);
  error = signal('');

  ngOnInit(): void {
    this.cart.loadItems().subscribe({
      next: () => this.loading.set(false),
      error: (error) => {
        this.error.set(errorMessage(error));
        this.loading.set(false);
      },
    });
  }
}
