import { inject, Injectable, signal } from '@angular/core';
import { RatesCache } from '../models/rates-cache.type';
import { HttpClient } from '@angular/common/http';
import { map, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private ratesCache: RatesCache = {};
  private http = inject(HttpClient);
  private baseUrl = 'https://api.frankfurter.dev/v1/';

  public currencies = signal<{code: string, name: string}[]>([]);

  constructor() {
    this.storeAvailableCurrencies();
   }

  // getRateFromApi(base: string, target: string): Observable<number> {
  //   // Defining a const for checking if the rate is cached
  //   const cachedRate = this.ratesCache[base]?.[target];
  //   if (cachedRate) {
  //     return of(cachedRate);
  //   }
  //   const getRateUrl = `${this.baseUrl}/latest?from=${base}&to=${target}`;

  //   return this.http.get
  // }

  private getAvailableCurrencies(): Observable<{code: string, name: string}[]> {
    const getCurrenciesUrl = `${this.baseUrl}currencies`;
    return this.http.get<Record<string, string>>(getCurrenciesUrl).pipe(
      map(currencies => Object.entries(currencies).map(([code, name]) => ({ code, name }))),
    );
  }

  private storeAvailableCurrencies(): void {
    this.getAvailableCurrencies().subscribe({
      next: (currencies) => {
        this.currencies.set(currencies);
        console.log('Currencies fetched from server and stored successfully:', currencies);
      },
      error: (error) => {
        console.error('Error fetching currencies from server:', error);
        this.currencies.set([]);
      }
    });
  }
}
