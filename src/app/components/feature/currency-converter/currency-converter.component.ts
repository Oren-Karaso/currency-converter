import { Component, inject, linkedSignal, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CurrencyService } from '../../../services/currency-service/currency.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { take } from 'rxjs';
import { CommonModule } from '@angular/common';
import { HistoryService } from '../../../services/history-service/history.service';

@Component({
  selector: 'app-currency-converter',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatProgressSpinnerModule, CommonModule],
  templateUrl: './currency-converter.component.html',
  styleUrl: './currency-converter.component.scss'
})
export class CurrencyConverterComponent implements OnInit {
  public form: FormGroup | null = null;
  private historyService = inject(HistoryService);
  private currencyService = inject(CurrencyService);
  private fb = inject(FormBuilder);
  private currencies = this.currencyService.currencies;
  public fromcurrencies = linkedSignal(() => this.currencies());
  public toCurrencies = linkedSignal(() => this.currencies());
  public calculatedRate = 0;
  protected isFetchingRate = signal<boolean>(false);

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.form = this.fb.group({
      amount: [0, [Validators.required, Validators.min(0.01)]],
      fromCurrency: [null, Validators.required],
      toCurrency: [null, Validators.required]
    });

    this.setupValuechanges();
  }

  private setupValuechanges(): void {
    this.form?.get('fromCurrency')?.valueChanges.subscribe((fromCurrency) => {
      this.toCurrencies.update(() => this.currencies().filter(currency => currency.code !== fromCurrency));
    });

    this.form?.get('toCurrency')?.valueChanges.subscribe((toCurrency) => {
      this.fromcurrencies.update(() => this.currencies().filter(currency => currency.code !== toCurrency));
    });
  }

  getRate(): void {
    this.fetchingData();
    const toCurrency = this.form?.get('toCurrency')?.value;
    const fromCurrency = this.form?.get('fromCurrency')?.value;
    const amount = this.form?.get('amount')?.value;
    this.updateCalculatedRate(fromCurrency, toCurrency, amount);
  }

  private fetchingData() {
    this.isFetchingRate.set(true);
    this.form?.disable();
  }

  private updateCalculatedRate(fromCurrency: any, toCurrency: any, amount: any) {
    this.currencyService.getRateFromApi(fromCurrency, toCurrency).pipe(take(1)).subscribe(rate => {
      this.calculatedRate = rate * amount;
      this.dataFetched();
    });
    this.historyService.getRatesPerLastWeek(fromCurrency, toCurrency).pipe(take(1)).subscribe(history => {
    });
  }

  private dataFetched() {
    this.isFetchingRate.set(false);
    this.form?.enable();
  }
}
