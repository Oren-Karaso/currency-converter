import { inject, Injectable } from '@angular/core';
import { ChartData } from 'chart.js';
import { HistoryService } from '../history-service/history.service';

interface EmptyLineChart {
    labels: [],
    datasets: []
}

const EMPTY_CHART: EmptyLineChart = {
    labels: [],
    datasets: []
};

@Injectable({
    providedIn: 'root'
})
export class ChartService {
    private historyService = inject(HistoryService);

    public buildChartData(): ChartData<'line'> | EmptyLineChart {
        const ratesFromLastWeek = this.historyService.getWeekSpanRates();
        if (!ratesFromLastWeek) return EMPTY_CHART;

        const data = ratesFromLastWeek.rates;
        const labels = Object.keys(ratesFromLastWeek.rates);
        const dates: string[] = Object.keys(data);
        const rates: number[] = Object.values(data).map(rateObj => {
            const firstCurrency = Object.keys(rateObj)[0];
            return rateObj[firstCurrency];
        });

        return {
            labels: labels,
            datasets: [{
                label: `Exchange rate history of past week (per 1 ${ratesFromLastWeek.base})`,
                data: rates,
                fill: true,
                tension: 0.3,
                borderColor: 'rgba(75,192,192,1)',
                backgroundColor: 'rgba(75,192,192,0.2)',
            }]
        };
    }
}
