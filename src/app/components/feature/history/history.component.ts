import { Component, inject, OnInit } from '@angular/core';
import { RatesCache } from '../../../models/rates-cache.type';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { DataRow } from '../../../models/data-row.interface';
import { HistoryService } from '../../../services/history-service/history.service';

@Component({
  selector: 'app-history',
  imports: [MatTableModule, CommonModule],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss'
})
export class HistoryComponent implements OnInit {
  private historyService = inject(HistoryService);
  history: RatesCache | null = null;
  rows: DataRow[] = [];
  colHeaders: string[] = ['base', 'target', 'rate'];
  constructor() {
  }

  ngOnInit(): void {
    this.history = this.historyService.getCachedHistory();
    this.createDataForTable();
  }

  private createDataForTable() {
    for (const fromCurrency in this.history) { // Iterate over base currencies
      for (const toCurrency in this.history[fromCurrency]) { // Iterate over target currencies
        this.rows.push({
          base: fromCurrency,
          target: toCurrency,
          rate: this.history[fromCurrency][toCurrency]
        });
      }
    }
  }
}
