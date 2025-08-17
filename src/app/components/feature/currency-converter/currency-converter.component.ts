import { Component, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CurrencyService } from '../../../services/currency-service/currency.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BaseChartDirective } from 'ng2-charts';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { map, Subject, switchMap, tap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { HistoryService } from '../../../services/history-service/history.service';
import { Chart, ChartOptions, registerables } from 'chart.js';
import { ChartService } from '../../../services/chart-service/chart.service';

@Component({
  selector: 'app-currency-converter',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatProgressSpinnerModule, CommonModule, BaseChartDirective],
  templateUrl: './currency-converter.component.html',
  styleUrl: './currency-converter.component.scss'
})
export class CurrencyConverterComponent {
  private fb = inject(FormBuilder);
  public form: FormGroup = this.fb.group({
    amount: [1, [Validators.required, Validators.min(0.01)]],
    fromCurrency: ['', Validators.required],
    toCurrency: ['', Validators.required]
  });

  private selectedFrom = toSignal(this.form.controls['fromCurrency'].valueChanges, { initialValue: '' });
  private selectedTo = toSignal(this.form.controls['toCurrency'].valueChanges, { initialValue: '' });

  protected fromCurrencies = computed(() => this.currencies().filter(c => c.code !== this.selectedTo()));
  protected toCurrencies = computed(() => this.currencies().filter(c => c.code !== this.selectedFrom()));

  private getRateFromApi$ = new Subject<void>();
  private getRatesPerLastWeek$ = new Subject<void>();

  protected chartData = toSignal(
    this.getRatesPerLastWeek$.pipe(
      switchMap(() => {
        const { fromCurrency, toCurrency } = this.form.getRawValue();
        return this.historyService.getRatesPerLastWeek(fromCurrency, toCurrency)
      }),
      map(() => this.chartService.buildChartData()),
      tap(() => this.isFreshChart.set(true))
    ));

  protected calculatedRate = toSignal(
    this.getRateFromApi$.pipe(
      tap(() => {
        this.form.disable();
        this.isFetchingRate.set(true);
        this.isFreshChart.set(false);
      }),
      switchMap(() => {
        const { fromCurrency, toCurrency } = this.form.getRawValue();
        return this.currencyService.getRateFromApi(fromCurrency!, toCurrency!);
      }),
      map(rate => rate * this.form.get('amount')?.value!),
      tap(() => {
        this.form.enable();
        this.form.markAsUntouched();
        this.isFetchingRate.set(false);
      })
    ),
    { initialValue: 0 }
  );

  protected isFetchingRate = signal<boolean>(false);
  protected isFreshChart = signal<boolean>(false);
  public lineChartOptions: ChartOptions<'line'> = { responsive: true };
  private historyService = inject(HistoryService);
  private currencyService = inject(CurrencyService);
  private chartService = inject(ChartService);
  private currencies = this.currencyService.currencies;

  constructor() {
    Chart.register(...registerables);
  }

  getRate() {
    this.getRateFromApi$.next();
  }

  showChart() {
    this.getRatesPerLastWeek$.next();
  }
}
