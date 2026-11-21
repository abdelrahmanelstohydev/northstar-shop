import { HttpErrorResponse } from '@angular/common/http';
import { currentI18n } from './i18n.service';
import { LocalizedText, TranslationKey } from './translations';

// Messages sent by the backend (always English) mapped to translated UI strings.
const SERVER_MESSAGES: Record<string, TranslationKey> = {
  'Invalid username or password': 'err.invalidLogin',
  'Category still has items': 'err.categoryHasItems',
  'Category does not exist': 'err.categoryMissing',
  'Item not found': 'err.itemNotFoundAdmin',
  'Order not found': 'err.orderNotFound',
  'Category not found': 'err.categoryNotFound',
  'Online payment is not available': 'err.payUnavailable',
  'Could not start the online payment. Please try again or pay on delivery.': 'err.payStart',
};

export function errorMessage(error: unknown): string {
  const i18n = currentI18n();

  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return i18n.t('err.network');
    }
    const message = error.error?.message;
    if (typeof message === 'string') {
      if (message.startsWith('Not enough stock for')) {
        const name = i18n.loc(error.error?.itemName as LocalizedText | undefined) || message.replace('Not enough stock for', '').trim();
        return i18n.t('err.stock', { name });
      }
      const key = SERVER_MESSAGES[message];
      return key ? i18n.t(key) : message;
    }
  }
  return i18n.t('err.generic');
}
