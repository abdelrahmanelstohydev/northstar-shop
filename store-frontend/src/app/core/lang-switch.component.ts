import { Component, inject } from '@angular/core';
import { I18nService } from './i18n.service';

@Component({
  selector: 'app-lang-switch',
  template: `
    <button type="button" class="lang-switch" (click)="i18n.toggle()" [attr.aria-label]="i18n.t('lang.switch')" [title]="i18n.t('lang.switch')">
      <span class="globe" aria-hidden="true">&#127760;</span>
      <span>{{ i18n.t('lang.other') }}</span>
    </button>
  `,
})
export class LangSwitchComponent {
  i18n = inject(I18nService);
}
