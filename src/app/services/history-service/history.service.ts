import { inject, Injectable } from '@angular/core';
import { RatesCache } from '../../models/rates-cache.type';
import { HttpClient } from '@angular/common/http';
import { RatesHistoryRes } from '../../models/rates-history-res.interface';
import { tap } from 'rxjs/internal/operators/tap';
import { catchError, Observable, of } from 'rxjs';

const STORAGE_KEY = 'CURRENCIES_HISTORY';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private weekSpanRates: RatesHistoryRes | null = null;
  private ratesCache: RatesCache = {};
  private http = inject(HttpClient);
  private baseUrl = 'https://api.frankfurter.dev/v1/';

  constructor() { }

  getCachedHistory(): RatesCache {
    return Object.keys(this.ratesCache).length ? this.ratesCache : this.getHistoryFromLocalStorage();
  }

  getWeekSpanRates(): RatesHistoryRes | null {
    return this.weekSpanRates;
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

  getRatesPerLastWeek(base: string, target: string): Observable<RatesHistoryRes | null> {
    const getRatesHistoryUrl = `${this.baseUrl}${this.getAWeekAgoFormatted()}..?base=${base}&symbols=${target}`;

    return this.http.get<RatesHistoryRes>(getRatesHistoryUrl).pipe(
      tap(rates => this.weekSpanRates = rates),
      catchError(error => {
        console.error('Error fetching exchange rates for the past week:', error);
        return of(null);
      })
    );
  }

  private getAWeekAgoFormatted(): string {
    const aWeekAgo = new Date(new Date().setDate(new Date().getDate() - 7));
    return aWeekAgo.toISOString().split('T')[0];
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
