import { Injectable, computed, signal } from '@angular/core';
import { readJson, writeJson } from './storage';

const KEY = 'favorites';

function loadIds(): string[] {
  const stored = readJson<unknown>(KEY, []);
  return Array.isArray(stored) ? stored.filter((id): id is string => typeof id === 'string') : [];
}

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  readonly ids = signal<string[]>(loadIds());
  readonly count = computed(() => this.ids().length);

  has(id: string): boolean {
    return this.ids().includes(id);
  }

  toggle(id: string): void {
    this.save(this.has(id) ? this.ids().filter((x) => x !== id) : [...this.ids(), id]);
  }

  remove(id: string): void {
    this.save(this.ids().filter((x) => x !== id));
  }

  private save(ids: string[]): void {
    this.ids.set(ids);
    writeJson(KEY, ids);
  }
}
