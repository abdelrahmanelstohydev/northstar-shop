import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { ApiService } from './api.service';
import { CartLine, CartRow, Item } from './models';
import { readJson, writeJson } from './storage';

const KEY = 'cart';
const MAX_QUANTITY = 99;

function loadLines(): CartLine[] {
  const stored = readJson<unknown>(KEY, []);
  if (!Array.isArray(stored)) {
    return [];
  }
  return stored.filter(
    (line): line is CartLine =>
      !!line &&
      typeof line.itemId === 'string' &&
      Number.isInteger(line.quantity) &&
      line.quantity >= 1 &&
      line.quantity <= MAX_QUANTITY
  );
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private api = inject(ApiService);

  readonly lines = signal<CartLine[]>(loadLines());
  readonly items = signal<Item[]>([]);

  readonly count = computed(() => this.lines().reduce((sum, line) => sum + line.quantity, 0));

  readonly rows = computed<CartRow[]>(() => {
    const byId = new Map(this.items().map((item) => [item._id, item]));
    return this.lines()
      .filter((line) => byId.has(line.itemId))
      .map((line) => ({ item: byId.get(line.itemId)!, quantity: line.quantity }));
  });

  readonly total = computed(() => {
    const sum = this.rows().reduce((acc, row) => acc + row.item.price * row.quantity, 0);
    return Math.round(sum * 100) / 100;
  });

  add(itemId: string, quantity = 1): void {
    const existing = this.lines().find((line) => line.itemId === itemId);
    if (existing) {
      this.setQuantity(itemId, existing.quantity + quantity);
    } else {
      this.save([...this.lines(), { itemId, quantity: Math.min(MAX_QUANTITY, quantity) }]);
    }
  }

  setQuantity(itemId: string, quantity: number): void {
    const safe = Math.min(MAX_QUANTITY, Math.max(1, quantity));
    this.save(this.lines().map((line) => (line.itemId === itemId ? { ...line, quantity: safe } : line)));
  }

  remove(itemId: string): void {
    this.save(this.lines().filter((line) => line.itemId !== itemId));
  }

  clear(): void {
    this.items.set([]);
    this.save([]);
  }

  loadItems(): Observable<Item[]> {
    const ids = this.lines().map((line) => line.itemId);
    if (ids.length === 0) {
      this.items.set([]);
      return of([] as Item[]);
    }
    return this.api.getItemsByIds(ids).pipe(
      tap((items) => {
        this.items.set(items);
        const found = new Set(items.map((item) => item._id));
        this.lines()
          .filter((line) => !found.has(line.itemId))
          .forEach((line) => this.remove(line.itemId));
      })
    );
  }

  private save(lines: CartLine[]): void {
    this.lines.set(lines);
    writeJson(KEY, lines);
  }
}
