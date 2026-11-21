import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { I18nService } from '../core/i18n.service';
import { Order, OrderStatus } from '../core/models';
import { PricePipe } from '../core/price.pipe';
import { errorMessage } from '../core/utils';

@Component({
  selector: 'app-order-details',
  imports: [RouterLink, FormsModule, DatePipe, PricePipe],
  template: `
    <div class="page-head">
      <h1 class="page-title">{{ i18n.t('order.title') }}</h1>
      <a routerLink="/admin/orders" class="btn btn-ghost">{{ i18n.t('order.back') }}</a>
    </div>

    @if (error()) {
      <div class="alert alert-error">{{ error() }}</div>
    }
    @if (message()) {
      <div class="alert alert-success">{{ message() }}</div>
    }

    @if (loading()) {
      <p class="muted">{{ i18n.t('common.loading') }}</p>
    } @else if (order(); as current) {
      <div class="two-col even">
        <section class="card panel">
          <h2>{{ i18n.t('order.customer') }}</h2>
          <dl class="details">
            <dt>{{ i18n.t('common.name') }}</dt>
            <dd>{{ current.customer.name }}</dd>
            <dt>{{ i18n.t('orders.phone') }}</dt>
            <dd><a [href]="'tel:' + current.customer.phone">{{ current.customer.phone }}</a></dd>
            @if (current.customer.email) {
              <dt>{{ i18n.t('order.email') }}</dt>
              <dd><a [href]="'mailto:' + current.customer.email">{{ current.customer.email }}</a></dd>
            }
            <dt>{{ i18n.t('order.address') }}</dt>
            <dd>{{ current.customer.address }}</dd>
            <dt>{{ i18n.t('order.placedOn') }}</dt>
            <dd>{{ current.createdAt | date: 'd MMM y, h:mm a' : undefined : i18n.lang() }}</dd>
          </dl>
        </section>

        <section class="card panel">
          <h2>{{ i18n.t('common.status') }}</h2>
          <p>
            <span class="badge big" [class.badge-opened]="current.status === 'opened'" [class.badge-closed]="current.status === 'closed'">
              {{ i18n.t(current.status === 'opened' ? 'status.opened' : 'status.closed') }}
            </span>
          </p>
          <dl class="details">
            <dt>{{ i18n.t('order.paymentMethod') }}</dt>
            <dd>{{ current.paymentMethod === 'stripe' ? i18n.t('pay.online') : i18n.t('pay.cod') }}</dd>
            @if (current.paymentMethod === 'stripe') {
              <dt>{{ i18n.t('orders.payment') }}</dt>
              <dd>
                <span class="badge" [class.badge-opened]="current.paymentStatus === 'paid'" [class.badge-warn]="current.paymentStatus === 'pending'" [class.badge-closed]="current.paymentStatus === 'failed'">
                  {{ i18n.t(current.paymentStatus === 'paid' ? 'pay.status.paid' : current.paymentStatus === 'failed' ? 'pay.status.failed' : 'pay.status.pending') }}
                </span>
              </dd>
              @if (current.stripeDetails?.sessionId) {
                <dt>{{ i18n.t('order.stripeSession') }}</dt>
                <dd class="small" dir="ltr">{{ current.stripeDetails?.sessionId }}</dd>
              }
            }
          </dl>
          @if (current.status === 'opened') {
            <button type="button" class="btn btn-primary" (click)="setStatus('closed')">{{ i18n.t('order.markClosed') }}</button>
          } @else {
            <button type="button" class="btn btn-outline" (click)="setStatus('opened')">{{ i18n.t('order.reopen') }}</button>
          }
        </section>
      </div>

      <section class="card table-card spaced">
        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>{{ i18n.t('items.item') }}</th><th>{{ i18n.t('common.price') }}</th><th>{{ i18n.t('common.quantity') }}</th><th class="right">{{ i18n.t('order.subtotal') }}</th></tr>
            </thead>
            <tbody>
              @for (line of current.items; track line.itemId) {
                <tr>
                  <td>{{ i18n.loc(line.name) }}</td>
                  <td>{{ line.price | price }}</td>
                  <td>{{ line.quantity }}</td>
                  <td class="right">{{ line.price * line.quantity | price }}</td>
                </tr>
              }
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" class="right"><strong>{{ i18n.t('common.total') }}</strong></td>
                <td class="right"><strong>{{ current.total | price }}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <section class="card panel spaced">
        <h2>{{ i18n.t('order.notes') }} <span class="muted small">({{ notes().length }})</span></h2>

        <textarea
          rows="3"
          name="newNote"
          maxlength="1000"
          [(ngModel)]="newNote"
          [placeholder]="i18n.t('order.notePlaceholder')"
        ></textarea>
        <button type="button" class="btn btn-primary" [disabled]="savingNote()" (click)="addNote()">
          {{ savingNote() ? i18n.t('order.adding') : i18n.t('order.addNote') }}
        </button>

        <div class="note-list">
          @for (note of notes(); track $index) {
            <article class="note">
              <time class="note-date">{{ note.createdAt | date: 'd MMM y, h:mm a' : undefined : i18n.lang() }}</time>
              <p class="note-text">{{ note.text }}</p>
            </article>
          } @empty {
            <p class="muted">{{ i18n.t('order.noNotes') }}</p>
          }
        </div>
      </section>
    }
  `,
})
export class OrderDetailsComponent implements OnInit {
  private api = inject(ApiService);
  i18n = inject(I18nService);
  private route = inject(ActivatedRoute);

  order = signal<Order | null>(null);
  loading = signal(true);
  savingNote = signal(false);
  error = signal('');
  message = signal('');
  newNote = '';

  notes = computed(() => [...(this.order()?.notes ?? [])].reverse());

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.api.getOrder(id).subscribe({
      next: (order) => {
        this.order.set(order);
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set(errorMessage(error));
        this.loading.set(false);
      },
    });
  }

  setStatus(status: OrderStatus): void {
    const order = this.order();
    if (!order) {
      return;
    }
    this.error.set('');
    this.message.set('');
    this.api.setOrderStatus(order._id, status).subscribe({
      next: () => {
        this.order.set({ ...order, status });
        this.message.set(this.i18n.t(status === 'closed' ? 'order.closed' : 'order.reopened'));
      },
      error: (error) => this.error.set(errorMessage(error)),
    });
  }

  addNote(): void {
    const order = this.order();
    const text = this.newNote.trim();
    if (!order) {
      return;
    }
    if (!text) {
      this.error.set(this.i18n.t('order.noteFirst'));
      this.message.set('');
      return;
    }

    this.error.set('');
    this.message.set('');
    this.savingNote.set(true);
    this.api.addOrderNote(order._id, text).subscribe({
      next: (note) => {
        const current = this.order();
        if (current) {
          this.order.set({ ...current, notes: [...current.notes, note] });
        }
        this.newNote = '';
        this.message.set(this.i18n.t('order.noteAdded'));
        this.savingNote.set(false);
      },
      error: (error) => {
        this.error.set(errorMessage(error));
        this.savingNote.set(false);
      },
    });
  }
}
