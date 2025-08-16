import { inject, Injectable } from '@angular/core';
import { RatesCache } from '../../models/rates-cache.type';
import { HttpClient } from '@angular/common/http';
import { RatesHistoryRes } from '../../models/rates-history-res.interface';
import { tap } from 'rxjs/internal/operators/tap';
import { Observable } from 'rxjs';

const STORAGE_KEY = 'CURRENCIES_HISTORY';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private ratesCache: RatesCache = {};
  private http = inject(HttpClient);
  private baseUrl = 'https://api.frankfurter.dev/v1/';

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

  getRatesPerLastWeek(base: string, target: string): Observable<any> {
    const getRatesHistoryUrl = `${this.baseUrl}${this.getTodayFormatted()}...?base=${base}&symbols=${target}`;

    return this.http.get<RatesHistoryRes>(getRatesHistoryUrl).pipe(
      // map(res => res.rates[target]),
      tap(rate => console.log(`Fetched rates for ${base} to ${target}:`, rate)
      ),
      // catchError(error => {
      //   console.error(`Error fetching exchange rate from API: ${base} to ${target}`, error);
      //   return of(0);
      // })
    );
  }

  private getTodayFormatted(): string {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Format as YYYY-MM-DD
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
