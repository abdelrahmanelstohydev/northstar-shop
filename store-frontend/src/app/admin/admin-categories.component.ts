import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { I18nService } from '../core/i18n.service';
import { Category } from '../core/models';
import { errorMessage } from '../core/utils';

@Component({
  selector: 'app-admin-categories',
  imports: [FormsModule],
  template: `
    <h1 class="page-title">{{ i18n.t('cat.title') }}</h1>

    @if (error()) {
      <div class="alert alert-error">{{ error() }}</div>
    }

    <form class="card inline-form" (ngSubmit)="add()">
      <input type="text" name="newNameAr" dir="rtl" lang="ar" [(ngModel)]="newNameAr" [placeholder]="i18n.t('cat.nameAr')" maxlength="60" />
      <input type="text" name="newNameEn" dir="ltr" lang="en" [(ngModel)]="newNameEn" [placeholder]="i18n.t('cat.nameEn')" maxlength="60" />
      <button type="submit" class="btn btn-primary">{{ i18n.t('cat.add') }}</button>
    </form>

    <div class="card table-card">
      @if (loading()) {
        <p class="muted pad">{{ i18n.t('common.loading') }}</p>
      } @else {
        <table>
          <thead>
            <tr><th>{{ i18n.t('cat.nameAr') }}</th><th>{{ i18n.t('cat.nameEn') }}</th><th class="right">{{ i18n.t('common.actions') }}</th></tr>
          </thead>
          <tbody>
            @for (category of categories(); track category._id) {
              <tr>
                <td>
                  @if (editingId() === category._id) {
                    <input type="text" name="editNameAr" dir="rtl" lang="ar" [(ngModel)]="editNameAr" maxlength="60" (keyup.enter)="save(category)" />
                  } @else {
                    <span dir="rtl" lang="ar">{{ category.name.ar }}</span>
                  }
                </td>
                <td>
                  @if (editingId() === category._id) {
                    <input type="text" name="editNameEn" dir="ltr" lang="en" [(ngModel)]="editNameEn" maxlength="60" (keyup.enter)="save(category)" />
                  } @else {
                    <span dir="ltr" lang="en">{{ category.name.en }}</span>
                  }
                </td>
                <td class="right actions">
                  @if (editingId() === category._id) {
                    <button type="button" class="btn btn-primary btn-sm" (click)="save(category)">{{ i18n.t('common.save') }}</button>
                    <button type="button" class="btn btn-ghost btn-sm" (click)="cancel()">{{ i18n.t('common.cancel') }}</button>
                  } @else {
                    <button type="button" class="btn btn-outline btn-sm" (click)="edit(category)">{{ i18n.t('common.edit') }}</button>
                    <button type="button" class="btn btn-danger btn-sm" (click)="remove(category)">{{ i18n.t('common.delete') }}</button>
                  }
                </td>
              </tr>
            } @empty {
              <tr><td colspan="3" class="muted">{{ i18n.t('cat.empty') }}</td></tr>
            }
          </tbody>
        </table>
      }
    </div>
  `,
})
export class AdminCategoriesComponent implements OnInit {
  private api = inject(ApiService);
  i18n = inject(I18nService);

  categories = signal<Category[]>([]);
  loading = signal(true);
  error = signal('');
  editingId = signal<string | null>(null);
  newNameAr = '';
  newNameEn = '';
  editNameAr = '';
  editNameEn = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set(errorMessage(error));
        this.loading.set(false);
      },
    });
  }

  add(): void {
    const name = { ar: this.newNameAr.trim(), en: this.newNameEn.trim() };
    if (!name.ar || !name.en) {
      this.error.set(this.i18n.t('cat.required'));
      return;
    }
    this.error.set('');
    this.api.createCategory(name).subscribe({
      next: () => {
        this.newNameAr = '';
        this.newNameEn = '';
        this.load();
      },
      error: (error) => this.error.set(errorMessage(error)),
    });
  }

  edit(category: Category): void {
    this.editingId.set(category._id);
    this.editNameAr = category.name.ar;
    this.editNameEn = category.name.en;
    this.error.set('');
  }

  cancel(): void {
    this.editingId.set(null);
  }

  save(category: Category): void {
    const name = { ar: this.editNameAr.trim(), en: this.editNameEn.trim() };
    if (!name.ar || !name.en) {
      this.error.set(this.i18n.t('cat.required'));
      return;
    }
    this.error.set('');
    this.api.updateCategory(category._id, name).subscribe({
      next: () => {
        this.editingId.set(null);
        this.load();
      },
      error: (error) => this.error.set(errorMessage(error)),
    });
  }

  remove(category: Category): void {
    if (!confirm(this.i18n.t('cat.confirmDelete', { name: this.i18n.loc(category.name) }))) {
      return;
    }
    this.error.set('');
    this.api.deleteCategory(category._id).subscribe({
      next: () => this.load(),
      error: (error) => this.error.set(errorMessage(error)),
    });
  }
}
