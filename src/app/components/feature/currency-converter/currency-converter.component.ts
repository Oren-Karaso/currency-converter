import { Component, computed, inject, linkedSignal, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CurrencyService } from '../../../services/currency.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-currency-converter',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  templateUrl: './currency-converter.component.html',
  styleUrl: './currency-converter.component.scss'
})
export class CurrencyConverterComponent implements OnInit {
  public form: FormGroup | null = null;
  private currencyService = inject(CurrencyService);
  private fb = inject(FormBuilder);
  private currencies =  this.currencyService.currencies;
  public fromcurrencies = linkedSignal(() => this.currencies());
  public toCurrencies = linkedSignal(() => this.currencies());
  public requestedRate = signal<number | null>(null);

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.form = this.fb.group({
      amount: [1, [Validators.required, Validators.min(0.01)]],
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

  //   getRate(fromCurrency: string, toCurrency: string): void {
  //     if (this.form) {
  //       const amount = this.form.get('amount')?.value;
  //       this.requestedRate.update(() => {
  //         this.currencyService.
  // })
  //     }
  //   }
}
