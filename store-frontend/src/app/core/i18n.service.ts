import { Injectable, effect, signal } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeAr from '@angular/common/locales/ar';
import { LocalizedText, Lang, TRANSLATIONS, TranslationKey } from './translations';

registerLocaleData(localeAr, 'ar');

const KEY = 'lang';

function isLang(value: unknown): value is Lang {
  return value === 'ar' || value === 'en';
}

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(KEY);
    if (isLang(saved)) {
      return saved;
    }
  } catch {}
  return typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('ar') ? 'ar' : 'en';
}

let instance: I18nService | null = null;

/** For plain helper functions that run outside Angular's injection context. */
export function currentI18n(): I18nService {
  return instance ?? new I18nService();
}

@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly lang = signal<Lang>(initialLang());

  constructor() {
    instance = this;
    effect(() => {
      const lang = this.lang();
      const root = document.documentElement;
      root.lang = lang;
      root.dir = lang === 'ar' ? 'rtl' : 'ltr';
      try {
        localStorage.setItem(KEY, lang);
      } catch {}
    });
  }

  isRtl(): boolean {
    return this.lang() === 'ar';
  }

  set(lang: Lang): void {
    this.lang.set(lang);
  }

  toggle(): void {
    this.lang.set(this.lang() === 'ar' ? 'en' : 'ar');
  }

  /** Translate a UI string. `{name}`-style placeholders are filled from `params`. */
  t(key: TranslationKey, params?: Record<string, string | number>): string {
    let text: string = TRANSLATIONS[key][this.lang()];
    if (params) {
      for (const [name, value] of Object.entries(params)) {
        text = text.split('{' + name + '}').join(String(value));
      }
    }
    return text;
  }

  /** Pick the current language from a value stored as { ar, en } in the database. */
  loc(value: LocalizedText | string | null | undefined): string {
    if (!value) {
      return '';
    }
    if (typeof value === 'string') {
      return value;
    }
    const lang = this.lang();
    return value[lang] || value[lang === 'ar' ? 'en' : 'ar'] || '';
  }
}
