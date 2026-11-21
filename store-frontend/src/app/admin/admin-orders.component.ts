import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { I18nService } from '../core/i18n.service';
import { Order, OrderStatus } from '../core/models';
import { PricePipe } from '../core/price.pipe';
import { errorMessage } from '../core/utils';

@Component({
  selector: 'app-admin-orders',
  imports: [RouterLink, DatePipe, PricePipe],
  template: `
    <h1 class="page-title">{{ i18n.t('orders.title') }}</h1>

    <div class="chips">
      <button type="button" class="chip" [class.active]="status() === ''" (click)="select('')">{{ i18n.t('common.all') }}</button>
      <button type="button" class="chip" [class.active]="status() === 'opened'" (click)="select('opened')">{{ i18n.t('status.opened') }}</button>
      <button type="button" class="chip" [class.active]="status() === 'closed'" (click)="select('closed')">{{ i18n.t('status.closed') }}</button>
    </div>

    @if (error()) {
      <div class="alert alert-error">{{ error() }}</div>
    }

    <div class="card table-card">
      @if (loading()) {
        <p class="muted pad">{{ i18n.t('common.loading') }}</p>
      } @else {
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{{ i18n.t('orders.date') }}</th>
                <th>{{ i18n.t('orders.customer') }}</th>
                <th>{{ i18n.t('orders.phone') }}</th>
                <th>{{ i18n.t('common.total') }}</th>
                <th>{{ i18n.t('orders.payment') }}</th>
                <th>{{ i18n.t('common.status') }}</th>
                <th class="right">{{ i18n.t('orders.details') }}</th>
              </tr>
            </thead>
            <tbody>
              @for (order of orders(); track order._id) {
                <tr>
                  <td>{{ order.createdAt | date: 'medium' : undefined : i18n.lang() }}</td>
                  <td>{{ order.customer.name }}</td>
                  <td>{{ order.customer.phone }}</td>
                  <td>{{ order.total | price }}</td>
                  <td>
                    <span class="block small">{{ order.paymentMethod === 'stripe' ? i18n.t('pay.online') : i18n.t('pay.cod') }}</span>
                    @if (order.paymentMethod === 'stripe') {
                      <span class="badge" [class.badge-opened]="order.paymentStatus === 'paid'" [class.badge-warn]="order.paymentStatus === 'pending'" [class.badge-closed]="order.paymentStatus === 'failed'">
                        {{ i18n.t(order.paymentStatus === 'paid' ? 'pay.status.paid' : order.paymentStatus === 'failed' ? 'pay.status.failed' : 'pay.status.pending') }}
                      </span>
                    }
                  </td>
                  <td>
                    <span class="badge" [class.badge-opened]="order.status === 'opened'" [class.badge-closed]="order.status === 'closed'">
                      {{ i18n.t(order.status === 'opened' ? 'status.opened' : 'status.closed') }}
                    </span>
                  </td>
                  <td class="right">
                    <a [routerLink]="['/admin/orders', order._id]" class="btn btn-outline btn-sm">{{ i18n.t('common.view') }}</a>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="7" class="muted">{{ i18n.t('orders.empty') }}</td></tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
})
export class AdminOrdersComponent implements OnInit {
  private api = inject(ApiService);
  i18n = inject(I18nService);

  orders = signal<Order[]>([]);
  status = signal<OrderStatus | ''>('');
  loading = signal(true);
  error = signal('');

  ngOnInit(): void {
    this.load();
  }

  select(status: OrderStatus | ''): void {
    this.status.set(status);
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.error.set('');
    this.api.getOrders(this.status() || undefined).subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set(errorMessage(error));
        this.loading.set(false);
      },
    });
  }
}
