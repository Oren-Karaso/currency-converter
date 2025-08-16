import { inject, Injectable, signal } from '@angular/core';
import { RatesCache } from '../models/rates-cache.type';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, take, tap } from 'rxjs';
import { RateResponse } from '../models/rate-response.interface';

const STORAGE_KEY = 'CURRENCIES_HISTORY';
@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private ratesCache: RatesCache = {};
  private http = inject(HttpClient);
  private baseUrl = 'https://api.frankfurter.dev/v1/';

  public currencies = signal<{ code: string, name: string }[]>([]);

  constructor() {
    this.storeAvailableCurrencies();
  }

  getRateFromApi(base: string, target: string): Observable<number> {
    // Defining a const for checking if the rate is cached
    const cachedRate = this.ratesCache[base]?.[target];
    if (cachedRate) {
      return of(cachedRate);
    }
    const getRateUrl = `${this.baseUrl}latest?base=${base}&symbols=${target}`;

    return this.http.get<RateResponse>(getRateUrl).pipe(
      map(res => res.rates[target]),
      tap(rate => this.addToCache(base, target, rate)),
      catchError(error => {
        console.error(`Error fetching exchange rate from API: ${base} to ${target}`, error);
        return of(0);
      })
    );
  }

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

  private setLocalStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.ratesCache));
  }

  private updateLocalStorage() {
    const history = { ...this.getHistoryFromLocalStorage(), ...this.ratesCache };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }

  private addToCache(base: string, target: string, rate: number): void {
    this.ratesCache[base] = this.ratesCache[base] || {};
    this.ratesCache[base][target] = rate;
  }

  private getAvailableCurrencies(): Observable<{ code: string, name: string }[]> {
    const getCurrenciesUrl = `${this.baseUrl}currencies`;
    return this.http.get<Record<string, string>>(getCurrenciesUrl).pipe(
      take(1),
      map(currencies => Object.entries(currencies).map(([code, name]) => ({ code, name }))),
    );
  }

  private storeAvailableCurrencies(): void {
    this.getAvailableCurrencies().subscribe({
      next: (currencies) => {
        this.currencies.set(currencies);
      },
      error: (error) => {
        console.error('Error fetching currencies from server:', error);
        this.currencies.set([]);
      }
    });
  }

  private getHistoryFromLocalStorage(): RatesCache {
    const history = localStorage.getItem(STORAGE_KEY);
    return history ? JSON.parse(history) : {};
  }
}

