import { inject, Injectable, signal } from '@angular/core';
import { RatesCache } from '../models/rates-cache.type';
import { HttpClient } from '@angular/common/http';
import { catchError, debounceTime, delay, map, Observable, of, take, tap } from 'rxjs';
import { RateResponse } from '../models/rate-response.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
    // Mock
    // if (Object.keys(this.ratesCache).length === 0) {
    //   this.ratesCache = {
    //     USD: { EUR: 0.85},
    //     EUR: { USD: 1.18, GBP: 0.88 },
    //     GBP: { USD: 1.33, EUR: 1.14 }, 
    //     AUD: { USD: 0.74, EUR: 0.63, GBP: 0.55 },
    //     CAD: { USD: 0.79, EUR: 0.67, GBP: 0.58 },
    //     NZD: { USD: 0.70 },
    //     CHF: { USD: 0.92, EUR: 0.80, GBP: 0.70 },
    //     CNY: { USD: 0.15, EUR: 0.13, GBP: 0.11 },
    //     JPY: { USD: 0.0091, EUR: 0.0078, GBP: 0.0067 },
    //     INR: { USD: 0.012, EUR: 0.010, GBP: 0.0085 },
    //     SGD: { USD: 0.74, EUR: 0.63, GBP: 0.55 },
    //     HKD: { USD: 0.13, EUR: 0.11, GBP: 0.095 },
    //     NOK: { USD: 0.11, EUR: 0.095, GBP: 0.08 },
    //     SEK: { USD: 0.11, EUR: 0.095, GBP: 0.08 },
    //     MXN: { USD: 0.052, EUR: 0.045, GBP: 0.038 },
    //     ZAR: { USD: 0.067, EUR: 0.058, GBP: 0.049 },
    //     ILS: { USD: 0.29, EUR: 0.25, GBP: 0.21 },
    //     TRY: { USD: 0.12, EUR: 0.10, GBP: 0.085 },
    //     AED: { USD: 0.27, EUR: 0.23, GBP: 0.19 },
    //     BRL: { USD: 0.19, EUR: 0.16, GBP: 0.14 },
    //     RUB: { USD: 0.013, EUR: 0.011, GBP: 0.0095 },

    //   };
    // }
        console.log('rate history;', this.ratesCache);
    return this.ratesCache;
  }

  private addToCache(base: string, target: string, rate: number): void {
    this.ratesCache[base] = this.ratesCache[base] || {};
    this.ratesCache[base][target] = rate;
  }

  private getAvailableCurrencies(): Observable<{ code: string, name: string }[]> {
    const getCurrenciesUrl = `${this.baseUrl}currencies`;
    return this.http.get<Record<string, string>>(getCurrenciesUrl).pipe(
      delay(2000), // Just to let the loader work
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
}

