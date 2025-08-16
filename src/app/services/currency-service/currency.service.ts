import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, take, tap } from 'rxjs';
import { RateResponse } from '../../models/rate-response.interface';
import { HistoryService } from '../history-service/history.service';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private http = inject(HttpClient);
  private historyService = inject(HistoryService);
  private baseUrl = 'https://api.frankfurter.dev/v1/';

  public currencies = signal<{ code: string, name: string }[]>([]);

  constructor() {
    this.storeAvailableCurrencies();
  }

  getRateFromApi(base: string, target: string): Observable<number> {
    // Defining a const for checking if the rate is cached
    const cachedRate = this.historyService.getCachedHistory()[base]?.[target];
    if (cachedRate) {
      return of(cachedRate);
    }
    const getRateUrl = `${this.baseUrl}latest?base=${base}&symbols=${target}`;

    return this.http.get<RateResponse>(getRateUrl).pipe(
      map(res => res.rates[target]),
      tap(rate => this.historyService.addToCache(base, target, rate)),
      catchError(error => {
        console.error(`Error fetching exchange rate from API: ${base} to ${target}`, error);
        return of(0);
      })
    );
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
}

