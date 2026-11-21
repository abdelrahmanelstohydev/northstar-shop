import { Pipe, PipeTransform, inject } from '@angular/core';
import { CURRENCY } from './config';
import { I18nService } from './i18n.service';
import { TRANSLATIONS } from './translations';

// Impure on purpose: the currency label changes when the language changes.
@Pipe({ name: 'price', pure: false })
export class PricePipe implements PipeTransform {
  private i18n = inject(I18nService);

  transform(value: number | null | undefined): string {
    const key = ('currency.' + CURRENCY) as keyof typeof TRANSLATIONS;
    const label = TRANSLATIONS[key] ? this.i18n.t(key) : CURRENCY;
    return (value ?? 0).toFixed(2) + ' ' + label;
  }
}
