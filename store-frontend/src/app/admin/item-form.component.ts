import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, forkJoin, of } from 'rxjs';
import { ApiService } from '../core/api.service';
import { I18nService } from '../core/i18n.service';
import { Category, Item } from '../core/models';
import { errorMessage } from '../core/utils';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 2 * 1024 * 1024;

function wholeNumber(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  return value === null || value === '' || Number.isInteger(Number(value)) ? null : { integer: true };
}

@Component({
  selector: 'app-item-form',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="page-head">
      <h1 class="page-title">{{ id() ? i18n.t('form.editItem') : i18n.t('form.addItem') }}</h1>
      <a routerLink="/admin/items" class="btn btn-ghost">{{ i18n.t('form.back') }}</a>
    </div>

    @if (loading()) {
      <p class="muted">{{ i18n.t('common.loading') }}</p>
    } @else {
      @if (categories().length === 0) {
        <div class="alert alert-error">
          {{ i18n.t('form.needCategory') }}
          <a routerLink="/admin/categories">{{ i18n.t('form.createCategory') }}</a>
        </div>
      }

      <form class="card form-card wide" [formGroup]="form" (ngSubmit)="submit()">
        <div class="form-row">
          <div class="form-group">
            <label for="nameAr">{{ i18n.t('form.nameAr') }}</label>
            <input id="nameAr" type="text" dir="rtl" lang="ar" formControlName="nameAr" maxlength="120" />
            @if (form.controls.nameAr.touched && form.controls.nameAr.invalid) {
              <small class="field-error">{{ i18n.t('form.nameErr') }}</small>
            }
          </div>
          <div class="form-group">
            <label for="nameEn">{{ i18n.t('form.nameEn') }}</label>
            <input id="nameEn" type="text" dir="ltr" lang="en" formControlName="nameEn" maxlength="120" />
            @if (form.controls.nameEn.touched && form.controls.nameEn.invalid) {
              <small class="field-error">{{ i18n.t('form.nameErr') }}</small>
            }
          </div>
        </div>

        <div class="form-group">
          <label for="descriptionAr">{{ i18n.t('form.descAr') }}</label>
          <textarea id="descriptionAr" rows="4" dir="rtl" lang="ar" formControlName="descriptionAr"></textarea>
          @if (form.controls.descriptionAr.touched && form.controls.descriptionAr.invalid) {
            <small class="field-error">{{ i18n.t('form.descErr') }}</small>
          }
        </div>

        <div class="form-group">
          <label for="descriptionEn">{{ i18n.t('form.descEn') }}</label>
          <textarea id="descriptionEn" rows="4" dir="ltr" lang="en" formControlName="descriptionEn"></textarea>
          @if (form.controls.descriptionEn.touched && form.controls.descriptionEn.invalid) {
            <small class="field-error">{{ i18n.t('form.descErr') }}</small>
          }
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="price">{{ i18n.t('common.price') }}</label>
            <input id="price" type="number" step="0.01" min="0" formControlName="price" />
            @if (form.controls.price.touched && form.controls.price.invalid) {
              <small class="field-error">{{ i18n.t('form.priceErr') }}</small>
            }
          </div>

          <div class="form-group">
            <label for="quantity">{{ i18n.t('form.stock') }}</label>
            <input id="quantity" type="number" step="1" min="0" formControlName="quantity" />
            @if (form.controls.quantity.touched && form.controls.quantity.invalid) {
              <small class="field-error">{{ i18n.t('form.stockErr') }}</small>
            }
          </div>
        </div>

        <div class="form-group">
          <label for="categoryId">{{ i18n.t('common.category') }}</label>
          <select id="categoryId" formControlName="categoryId">
            <option value="">{{ i18n.t('form.chooseCategory') }}</option>
            @for (category of categories(); track category._id) {
              <option [value]="category._id">{{ i18n.loc(category.name) }}</option>
            }
          </select>
          @if (form.controls.categoryId.touched && form.controls.categoryId.invalid) {
            <small class="field-error">{{ i18n.t('form.categoryErr') }}</small>
          }
        </div>

        <div class="form-group">
          <label for="image">{{ i18n.t('form.image') }}</label>
          <input id="image" type="file" accept="image/jpeg,image/png,image/webp" (change)="onFile($event)" />
          @if (previewUrl() || currentImage()) {
            <img class="preview" [src]="previewUrl() || api.imageUrl(currentImage())" [alt]="i18n.t('form.preview')" />
          }
        </div>

        @if (error()) {
          <div class="alert alert-error">{{ error() }}</div>
        }

        <button type="submit" class="btn btn-primary" [disabled]="saving()">
          {{ saving() ? i18n.t('form.saving') : i18n.t('form.save') }}
        </button>
      </form>
    }
  `,
})
export class ItemFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  api = inject(ApiService);
  i18n = inject(I18nService);

  id = signal<string | null>(null);
  categories = signal<Category[]>([]);
  currentImage = signal('');
  previewUrl = signal('');
  loading = signal(true);
  saving = signal(false);
  error = signal('');
  private file: File | null = null;

  form = this.fb.nonNullable.group({
    nameAr: ['', Validators.required],
    nameEn: ['', Validators.required],
    descriptionAr: ['', Validators.required],
    descriptionEn: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    quantity: [0, [Validators.required, Validators.min(0), wholeNumber]],
    categoryId: ['', Validators.required],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.id.set(id);

    forkJoin({
      categories: this.api.getCategories(),
      items: id ? this.api.getAdminItems() : of([] as Item[]),
    }).subscribe({
      next: (result) => {
        this.categories.set(result.categories);
        if (id) {
          const item = result.items.find((entry) => entry._id === id);
          if (item) {
            this.form.patchValue({
              nameAr: item.name.ar,
              nameEn: item.name.en,
              descriptionAr: item.description.ar,
              descriptionEn: item.description.en,
              price: item.price,
              quantity: item.quantity ?? 0,
              categoryId: item.categoryId,
            });
            this.currentImage.set(item.image);
          } else {
            this.error.set(this.i18n.t('form.notFound'));
          }
        }
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set(errorMessage(error));
        this.loading.set(false);
      },
    });
  }

  ngOnDestroy(): void {
    this.revokePreview();
  }

  onFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.revokePreview();
    this.file = null;
    this.error.set('');

    if (!file) {
      return;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      this.error.set(this.i18n.t('form.badType'));
      input.value = '';
      return;
    }
    if (file.size > MAX_SIZE) {
      this.error.set(this.i18n.t('form.tooBig'));
      input.value = '';
      return;
    }

    this.file = file;
    this.previewUrl.set(URL.createObjectURL(file));
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const data = new FormData();
    data.append('name_ar', value.nameAr.trim());
    data.append('name_en', value.nameEn.trim());
    data.append('description_ar', value.descriptionAr.trim());
    data.append('description_en', value.descriptionEn.trim());
    data.append('price', String(value.price));
    data.append('quantity', String(value.quantity));
    data.append('categoryId', value.categoryId);
    if (this.file) {
      data.append('image', this.file);
    }

    const id = this.id();
    const request: Observable<unknown> = id ? this.api.updateItem(id, data) : this.api.createItem(data);

    this.saving.set(true);
    this.error.set('');
    request.subscribe({
      next: () => this.router.navigate(['/admin/items']),
      error: (error) => {
        this.error.set(errorMessage(error));
        this.saving.set(false);
      },
    });
  }

  private revokePreview(): void {
    const url = this.previewUrl();
    if (url) {
      URL.revokeObjectURL(url);
      this.previewUrl.set('');
    }
  }
}
