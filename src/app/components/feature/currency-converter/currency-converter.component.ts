import { Component, inject, linkedSignal, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CurrencyService } from '../../../services/currency-service/currency.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BaseChartDirective } from 'ng2-charts';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { take } from 'rxjs';
import { CommonModule } from '@angular/common';
import { HistoryService } from '../../../services/history-service/history.service';
import { Chart, ChartData, ChartOptions, registerables } from 'chart.js';
import { ChartService } from '../../../services/chart-service/chart.service';

@Component({
  selector: 'app-currency-converter',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatProgressSpinnerModule, CommonModule, BaseChartDirective],
  templateUrl: './currency-converter.component.html',
  styleUrl: './currency-converter.component.scss'
})
export class CurrencyConverterComponent implements OnInit {
  public form: FormGroup | null = null;
  public fromCurrencies = linkedSignal(() => this.currencies());
  public toCurrencies = linkedSignal(() => this.currencies());
  protected calculatedRate = 0;
  protected isFetchingRate = signal<boolean>(false);
  protected chartData = signal<ChartData<'line'>>({
    labels: [],
    datasets: []
  });
  public lineChartOptions: ChartOptions<'line'> = { responsive: true };
  private historyService = inject(HistoryService);
  private currencyService = inject(CurrencyService);
  private chartService = inject(ChartService);
  private fb = inject(FormBuilder);
  private currencies = this.currencyService.currencies;

  constructor() {
    Chart.register(...registerables);
  }

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
      this.fromCurrencies.update(() => this.currencies().filter(currency => currency.code !== toCurrency));
    });
  }

  getRate(): void {
    this.fetchingData();
    const values = this.form?.value;
    this.updateCalculatedRate(values.fromCurrency, values.toCurrency, values.amount);
  }

  showChart() {
    const values = this.form?.value;
    this.historyService.getRatesPerLastWeek(values.fromCurrency, values.toCurrency).pipe(take(1)).subscribe(() => {
      this.updateChartData();
    });
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
  }

  private dataFetched() {
    this.isFetchingRate.set(false);
    this.form?.markAsUntouched();
    this.form?.enable();
  }

  private updateChartData() {
    this.chartData.set(this.chartService.buildChartData());
  }
}
