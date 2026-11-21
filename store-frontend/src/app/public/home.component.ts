import { Component, OnInit, inject, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { ApiService } from '../core/api.service';
import { I18nService } from '../core/i18n.service';
import { Category, Item } from '../core/models';
import { errorMessage } from '../core/utils';
import { ItemCardComponent } from './item-card.component';

@Component({
  selector: 'app-home',
  imports: [ItemCardComponent],
  template: `
    <section class="hero">
      <h1>{{ i18n.t('home.title') }}</h1>
      <p>{{ i18n.t('home.subtitle') }}</p>
    </section>

    <div class="chips">
      <button type="button" class="chip" [class.active]="selected() === ''" (click)="select('')">{{ i18n.t('common.all') }}</button>
      @for (category of categories(); track category._id) {
        <button type="button" class="chip" [class.active]="selected() === category._id" (click)="select(category._id)">
          {{ i18n.loc(category.name) }}
        </button>
      }
    </div>

    @if (error()) {
      <div class="alert alert-error">{{ error() }}</div>
    }

    @if (loading()) {
      <p class="muted center">{{ i18n.t('home.loading') }}</p>
    } @else {
      <div class="grid">
        @for (item of items(); track item._id) {
          <app-item-card [item]="item" />
        } @empty {
          <p class="muted">{{ i18n.t('home.empty') }}</p>
        }
      </div>
    }
  `,
})
export class HomeComponent implements OnInit {
  private api = inject(ApiService);
  i18n = inject(I18nService);
  private request?: Subscription;

  categories = signal<Category[]>([]);
  items = signal<Item[]>([]);
  selected = signal('');
  loading = signal(true);
  error = signal('');

  ngOnInit(): void {
    this.api.getCategories().subscribe({
      next: (categories) => this.categories.set(categories),
      error: (error) => this.error.set(errorMessage(error)),
    });
    this.loadItems();
  }

  select(categoryId: string): void {
    this.selected.set(categoryId);
    this.loadItems();
  }

  private loadItems(): void {
    this.request?.unsubscribe();
    this.loading.set(true);
    this.error.set('');
    this.request = this.api.getItems(this.selected() || undefined).subscribe({
      next: (items) => {
        this.items.set(items);
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set(errorMessage(error));
        this.loading.set(false);
      },
    });
  }
}
