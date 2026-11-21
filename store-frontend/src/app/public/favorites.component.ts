import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { FavoritesService } from '../core/favorites.service';
import { I18nService } from '../core/i18n.service';
import { Item } from '../core/models';
import { errorMessage } from '../core/utils';
import { ItemCardComponent } from './item-card.component';

@Component({
  selector: 'app-favorites',
  imports: [ItemCardComponent, RouterLink],
  template: `
    <h1 class="page-title">{{ i18n.t('fav.title') }}</h1>

    @if (error()) {
      <div class="alert alert-error">{{ error() }}</div>
    }

    @if (loading()) {
      <p class="muted center">{{ i18n.t('common.loading') }}</p>
    } @else if (visible().length === 0) {
      <div class="card empty">
        <p>{{ i18n.t('fav.empty') }}</p>
        <a routerLink="/" class="btn btn-primary">{{ i18n.t('fav.browse') }}</a>
      </div>
    } @else {
      <div class="grid">
        @for (item of visible(); track item._id) {
          <app-item-card [item]="item" />
        }
      </div>
    }
  `,
})
export class FavoritesComponent implements OnInit {
  private api = inject(ApiService);
  i18n = inject(I18nService);
  favorites = inject(FavoritesService);

  items = signal<Item[]>([]);
  loading = signal(true);
  error = signal('');

  visible = computed(() => this.items().filter((item) => this.favorites.has(item._id)));

  ngOnInit(): void {
    const ids = this.favorites.ids();
    if (ids.length === 0) {
      this.loading.set(false);
      return;
    }
    this.api.getItemsByIds(ids).subscribe({
      next: (items) => {
        this.items.set(items);
        const found = new Set(items.map((item) => item._id));
        ids.filter((id) => !found.has(id)).forEach((id) => this.favorites.remove(id));
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set(errorMessage(error));
        this.loading.set(false);
      },
    });
  }
}
