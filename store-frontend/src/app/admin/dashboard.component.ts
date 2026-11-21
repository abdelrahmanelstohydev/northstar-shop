import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ApiService } from '../core/api.service';
import { I18nService } from '../core/i18n.service';
import { Category, Item, Order } from '../core/models';
import { PricePipe } from '../core/price.pipe';
import { errorMessage } from '../core/utils';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, DatePipe, PricePipe],
  template: `
    <h1 class="page-title">{{ i18n.t('admin.dashboard') }}</h1>

    @if (error()) {
      <div class="alert alert-error">{{ error() }}</div>
    }

    @if (loading()) {
      <p class="muted">{{ i18n.t('common.loading') }}</p>
    } @else {
      <div class="stats">
        <a routerLink="/admin/orders" class="card stat">
          <span class="stat-number">{{ openedOrders().length }}</span>
          <span class="stat-label">{{ i18n.t('dash.opened') }}</span>
        </a>
        <a routerLink="/admin/items" class="card stat">
          <span class="stat-number">{{ items().length }}</span>
          <span class="stat-label">{{ i18n.t('dash.items') }}</span>
        </a>
        <a routerLink="/admin/categories" class="card stat">
          <span class="stat-number">{{ categories().length }}</span>
          <span class="stat-label">{{ i18n.t('dash.categories') }}</span>
        </a>
        <a routerLink="/admin/items" class="card stat warn">
          <span class="stat-number">{{ lowStock().length }}</span>
          <span class="stat-label">{{ i18n.t('dash.lowStockLabel') }}</span>
        </a>
      </div>

      <div class="two-col even">
        <section class="card panel">
          <h2>{{ i18n.t('dash.latest') }}</h2>
          @for (order of latestOrders(); track order._id) {
            <a [routerLink]="['/admin/orders', order._id]" class="list-row">
              <span>
                <strong>{{ order.customer.name }}</strong>
                <small class="muted block">{{ order.createdAt | date: 'medium' : undefined : i18n.lang() }}</small>
              </span>
              <span>{{ order.total | price }}</span>
            </a>
          } @empty {
            <p class="muted">{{ i18n.t('dash.noOpened') }}</p>
          }
        </section>

        <section class="card panel">
          <h2>{{ i18n.t('dash.lowStock') }}</h2>
          @for (item of lowStock(); track item._id) {
            <a [routerLink]="['/admin/items', item._id, 'edit']" class="list-row">
              <span>{{ i18n.loc(item.name) }}</span>
              <span class="badge" [class.badge-closed]="item.quantity === 0" [class.badge-warn]="item.quantity !== 0">
                {{ item.quantity === 0 ? i18n.t('dash.out') : i18n.t('dash.left', { n: item.quantity ?? 0 }) }}
              </span>
            </a>
          } @empty {
            <p class="muted">{{ i18n.t('dash.wellStocked') }}</p>
          }
        </section>
      </div>
    }
  `,
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);
  i18n = inject(I18nService);

  categories = signal<Category[]>([]);
  items = signal<Item[]>([]);
  openedOrders = signal<Order[]>([]);
  loading = signal(true);
  error = signal('');

  latestOrders = computed(() => this.openedOrders().slice(0, 5));
  lowStock = computed(() => this.items().filter((item) => (item.quantity ?? 0) <= 5));

  ngOnInit(): void {
    forkJoin({
      categories: this.api.getCategories(),
      items: this.api.getAdminItems(),
      orders: this.api.getOrders('opened'),
    }).subscribe({
      next: (result) => {
        this.categories.set(result.categories);
        this.items.set(result.items);
        this.openedOrders.set(result.orders);
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set(errorMessage(error));
        this.loading.set(false);
      },
    });
  }
}
