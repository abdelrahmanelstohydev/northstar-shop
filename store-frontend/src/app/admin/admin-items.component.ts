import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ApiService } from '../core/api.service';
import { I18nService } from '../core/i18n.service';
import { Category, Item } from '../core/models';
import { PricePipe } from '../core/price.pipe';
import { errorMessage } from '../core/utils';

@Component({
  selector: 'app-admin-items',
  imports: [RouterLink, PricePipe],
  template: `
    <div class="page-head">
      <h1 class="page-title">{{ i18n.t('admin.items') }}</h1>
      <a routerLink="/admin/items/new" class="btn btn-primary">{{ i18n.t('items.add') }}</a>
    </div>

    @if (error()) {
      <div class="alert alert-error">{{ error() }}</div>
    }

    <div class="toolbar">
      <label for="categoryFilter" class="muted">{{ i18n.t('common.category') }}</label>
      <select id="categoryFilter" (change)="filter($any($event.target).value)">
        <option value="">{{ i18n.t('items.allCategories') }}</option>
        @for (category of categories(); track category._id) {
          <option [value]="category._id">{{ i18n.loc(category.name) }}</option>
        }
      </select>
    </div>

    <div class="card table-card">
      @if (loading()) {
        <p class="muted pad">{{ i18n.t('common.loading') }}</p>
      } @else {
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{{ i18n.t('items.item') }}</th>
                <th>{{ i18n.t('common.category') }}</th>
                <th>{{ i18n.t('common.price') }}</th>
                <th>{{ i18n.t('common.quantity') }}</th>
                <th class="right">{{ i18n.t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              @for (item of items(); track item._id) {
                <tr>
                  <td>
                    <div class="cell-item">
                      <div class="thumb small">
                        @if (item.image) {
                          <img [src]="api.imageUrl(item.image)" [alt]="i18n.loc(item.name)" />
                        } @else {
                          <div class="placeholder">{{ i18n.loc(item.name).charAt(0) }}</div>
                        }
                      </div>
                      <span>{{ i18n.loc(item.name) }}</span>
                    </div>
                  </td>
                  <td>{{ categoryName(item.categoryId) }}</td>
                  <td>{{ item.price | price }}</td>
                  <td>
                    <span class="badge" [class.badge-closed]="item.quantity === 0" [class.badge-warn]="(item.quantity ?? 0) > 0 && (item.quantity ?? 0) <= 5" [class.badge-opened]="(item.quantity ?? 0) > 5">
                      {{ item.quantity }}
                    </span>
                  </td>
                  <td class="right actions">
                    <a [routerLink]="['/admin/items', item._id, 'edit']" class="btn btn-outline btn-sm">{{ i18n.t('common.edit') }}</a>
                    <button type="button" class="btn btn-danger btn-sm" (click)="remove(item)">{{ i18n.t('common.delete') }}</button>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="5" class="muted">{{ i18n.t('items.empty') }}</td></tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
})
export class AdminItemsComponent implements OnInit {
  api = inject(ApiService);
  i18n = inject(I18nService);

  categories = signal<Category[]>([]);
  items = signal<Item[]>([]);
  loading = signal(true);
  error = signal('');
  private selected = '';

  ngOnInit(): void {
    forkJoin({ categories: this.api.getCategories(), items: this.api.getAdminItems() }).subscribe({
      next: (result) => {
        this.categories.set(result.categories);
        this.items.set(result.items);
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set(errorMessage(error));
        this.loading.set(false);
      },
    });
  }

  categoryName(id: string): string {
    return this.i18n.loc(this.categories().find((category) => category._id === id)?.name) || '-';
  }

  filter(categoryId: string): void {
    this.selected = categoryId;
    this.loadItems();
  }

  remove(item: Item): void {
    if (!confirm(this.i18n.t('items.confirmDelete', { name: this.i18n.loc(item.name) }))) {
      return;
    }
    this.error.set('');
    this.api.deleteItem(item._id).subscribe({
      next: () => this.loadItems(),
      error: (error) => this.error.set(errorMessage(error)),
    });
  }

  private loadItems(): void {
    this.api.getAdminItems(this.selected || undefined).subscribe({
      next: (items) => this.items.set(items),
      error: (error) => this.error.set(errorMessage(error)),
    });
  }
}
