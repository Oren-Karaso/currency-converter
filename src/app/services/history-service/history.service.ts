import { Injectable } from '@angular/core';
import { RatesCache } from '../../models/rates-cache.type';

const STORAGE_KEY = 'CURRENCIES_HISTORY';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private ratesCache: RatesCache = {};

  constructor() { }

  getCachedHistory(): RatesCache {
    return Object.keys(this.ratesCache).length ? this.ratesCache : this.getHistoryFromLocalStorage();
  }

  saveHistoryToLocalStorage(): void {
    if (!Object.keys(this.getHistoryFromLocalStorage()).length) {
      this.setLocalStorage();
    } else {
      this.updateLocalStorage()
    }
  }

  addToCache(base: string, target: string, rate: number): void {
    this.ratesCache[base] = this.ratesCache[base] || {};
    this.ratesCache[base][target] = rate;
  }

  private setLocalStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.ratesCache));
  }

  private updateLocalStorage() {
    const history = { ...this.getHistoryFromLocalStorage(), ...this.ratesCache };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }

  private getHistoryFromLocalStorage(): RatesCache {
    const history = localStorage.getItem(STORAGE_KEY);
    return history ? JSON.parse(history) : {};
  }
}
