import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { CartService } from '../core/cart.service';
import { I18nService } from '../core/i18n.service';
import { PaymentMethod, PaymentState } from '../core/models';
import { PricePipe } from '../core/price.pipe';
import { errorMessage } from '../core/utils';

@Component({
  selector: 'app-checkout',
  imports: [ReactiveFormsModule, RouterLink, PricePipe],
  template: `
    @if (returning() === 'verifying') {
      <div class="card empty">
        <p>{{ i18n.t('pay.verifying') }}</p>
      </div>
    } @else if (returning() === 'cancelled') {
      <div class="card empty">
        <h1>{{ i18n.t('pay.cancelledTitle') }}</h1>
        <p>{{ i18n.t('pay.cancelledText') }}</p>
        <a routerLink="/cart" class="btn btn-primary">{{ i18n.t('pay.backToCart') }}</a>
      </div>
    } @else if (returning() === 'failed') {
      <div class="card empty">
        <h1>{{ i18n.t('pay.cancelledTitle') }}</h1>
        <p>{{ i18n.t('pay.failed') }}</p>
        <a routerLink="/cart" class="btn btn-primary">{{ i18n.t('pay.backToCart') }}</a>
      </div>
    } @else if (returning() === 'pending') {
      <div class="card empty">
        <p>{{ i18n.t('pay.pending') }}</p>
        <button type="button" class="btn btn-primary" (click)="verifyReturn()">{{ i18n.t('pay.checkAgain') }}</button>
      </div>
    } @else if (placed(); as order) {
      <div class="card success">
        <div class="success-icon">&#10003;</div>
        <h1>{{ i18n.t('checkout.thanks') }}</h1>
        <p>{{ i18n.t('checkout.orderNumber') }} <strong>{{ order.orderId }}</strong></p>
        <p>{{ i18n.t('common.total') }}: <strong>{{ order.total | price }}</strong></p>
        <p class="muted">{{ order.paid ? i18n.t('pay.paidOk') : i18n.t('checkout.callSoon') }}</p>
        <a routerLink="/" class="btn btn-primary">{{ i18n.t('checkout.back') }}</a>
      </div>
    } @else {
      <h1 class="page-title">{{ i18n.t('checkout.title') }}</h1>

      @if (loading()) {
        <p class="muted center">{{ i18n.t('common.loading') }}</p>
      } @else if (cart.rows().length === 0) {
        <div class="card empty">
          <p>{{ i18n.t('cart.empty') }}</p>
          <a routerLink="/" class="btn btn-primary">{{ i18n.t('cart.start') }}</a>
        </div>
      } @else {
        <div class="two-col">
          <form class="card form-card" [formGroup]="form" (ngSubmit)="submit()">
            <h2>{{ i18n.t('checkout.details') }}</h2>

            <div class="form-group">
              <label for="name">{{ i18n.t('checkout.fullName') }}</label>
              <input id="name" type="text" formControlName="name" autocomplete="name" />
              @if (form.controls.name.touched && form.controls.name.invalid) {
                <small class="field-error">{{ i18n.t('checkout.nameErr') }}</small>
              }
            </div>

            <div class="form-group">
              <label for="phone">{{ i18n.t('checkout.phone') }}</label>
              <input id="phone" type="tel" formControlName="phone" autocomplete="tel" />
              @if (form.controls.phone.touched && form.controls.phone.invalid) {
                <small class="field-error">{{ i18n.t('checkout.phoneErr') }}</small>
              }
            </div>

            <div class="form-group">
              <label for="email">{{ i18n.t('checkout.email') }}</label>
              <input id="email" type="email" dir="ltr" formControlName="email" autocomplete="email" />
              @if (form.controls.email.touched && form.controls.email.invalid) {
                <small class="field-error">{{ i18n.t('checkout.emailErr') }}</small>
              } @else {
                <small class="muted">{{ i18n.t('checkout.emailNote') }}</small>
              }
            </div>

            <div class="form-group">
              <label for="address">{{ i18n.t('checkout.address') }}</label>
              <textarea id="address" rows="3" formControlName="address" autocomplete="street-address"></textarea>
              @if (form.controls.address.touched && form.controls.address.invalid) {
                <small class="field-error">{{ i18n.t('checkout.addressErr') }}</small>
              }
            </div>

            @if (methods().length > 1) {
              <div class="form-group">
                <label>{{ i18n.t('pay.method') }}</label>
                <div class="pay-options">
                  @for (method of methods(); track method) {
                    <label class="pay-option" [class.selected]="form.controls.paymentMethod.value === method">
                      <input type="radio" formControlName="paymentMethod" [value]="method" />
                      <span>
                        <strong>{{ method === 'stripe' ? i18n.t('pay.stripe') : i18n.t('pay.cod') }}</strong>
                        <small class="muted block">{{ method === 'stripe' ? i18n.t('pay.stripeHint') : i18n.t('pay.codHint') }}</small>
                      </span>
                    </label>
                  }
                </div>
                @if (testMode() && form.controls.paymentMethod.value === 'stripe') {
                  <small class="muted">{{ i18n.t('pay.testMode') }}</small>
                }
              </div>
            }

            @if (error()) {
              <div class="alert alert-error">{{ error() }}</div>
            }

            <button type="submit" class="btn btn-primary btn-block" [disabled]="submitting()">
              {{ redirecting() ? i18n.t('pay.redirecting') : submitting() ? i18n.t('checkout.placing') : i18n.t('checkout.place') }}
            </button>
          </form>

          <aside class="card summary">
            <h2>{{ i18n.t('checkout.summary') }}</h2>
            @for (row of cart.rows(); track row.item._id) {
              <div class="summary-row">
                <span>{{ row.quantity }} &times; {{ i18n.loc(row.item.name) }}</span>
                <span>{{ row.item.price * row.quantity | price }}</span>
              </div>
            }
            <div class="summary-row total">
              <span>{{ i18n.t('common.total') }}</span>
              <strong>{{ cart.total() | price }}</strong>
            </div>
            <a routerLink="/cart" class="btn btn-ghost btn-block">{{ i18n.t('checkout.editCart') }}</a>
          </aside>
        </div>
      }
    }
  `,
})
export class CheckoutComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  i18n = inject(I18nService);
  cart = inject(CartService);

  loading = signal(true);
  submitting = signal(false);
  error = signal('');
  placed = signal<{ orderId: string; total: number; paid?: boolean } | null>(null);
  methods = signal<PaymentMethod[]>(['cod']);
  testMode = signal(false);
  redirecting = signal(false);
  // set when the customer comes back from the payment page
  returning = signal<'' | 'verifying' | 'pending' | 'failed' | 'cancelled'>('');
  private returnParams: { orderId: string; token: string } | null = null;

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s]{7,20}$/)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    address: ['', [Validators.required, Validators.maxLength(300)]],
    paymentMethod: ['cod' as PaymentMethod],
  });

  ngOnInit(): void {
    const query = this.route.snapshot.queryParamMap;
    const orderId = query.get('orderId');
    const token = query.get('token');
    if (orderId && token) {
      this.returnParams = { orderId, token };
      if (query.get('cancelled') === 'true') {
        this.returning.set('cancelled');
        // frees the reserved stock; the cart is left untouched
        this.api.cancelPayment(orderId, token).subscribe({ error: () => {} });
      } else if (query.get('session_id')) {
        this.verifyReturn();
      }
      if (this.returning()) {
        return;
      }
    }

    this.api.getPaymentMethods().subscribe({
      next: (result) => {
        this.methods.set(result.methods);
        this.testMode.set(result.stripeTestMode);
      },
      error: () => {},
    });

    this.cart.loadItems().subscribe({
      next: () => this.loading.set(false),
      error: (error) => {
        this.error.set(errorMessage(error));
        this.loading.set(false);
      },
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.cart.lines().length === 0 || this.submitting()) {
      return;
    }

    const value = this.form.getRawValue();
    const customer = { name: value.name.trim(), phone: value.phone.trim(), email: value.email.trim(), address: value.address.trim() };

    this.submitting.set(true);
    this.error.set('');
    this.api.createOrder(customer, this.cart.lines(), this.i18n.lang(), value.paymentMethod).subscribe({
      next: (result) => {
        if (result.checkoutUrl) {
          // Online payment: the cart is cleared only after the payment is confirmed.
          this.redirecting.set(true);
          window.location.href = result.checkoutUrl;
          return;
        }
        this.cart.clear();
        this.placed.set(result);
        this.submitting.set(false);
      },
      error: (error) => {
        this.error.set(errorMessage(error));
        this.submitting.set(false);
      },
    });
  }

  // Back from the payment page: ask the server whether the order was really paid.
  verifyReturn(): void {
    if (!this.returnParams) {
      return;
    }
    const { orderId, token } = this.returnParams;
    this.returning.set('verifying');
    this.api.getPaymentStatus(orderId, token).subscribe({
      next: (state: PaymentState) => {
        if (state.paymentStatus === 'paid') {
          this.cart.clear();
          this.placed.set({ orderId: state.orderId, total: state.total, paid: true });
          this.returning.set('');
        } else {
          this.returning.set(state.paymentStatus === 'failed' ? 'failed' : 'pending');
        }
      },
      error: () => this.returning.set('pending'),
    });
  }
}
