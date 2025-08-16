import { inject, Injectable } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
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
                label: 'Exchange Rate History of Past Week',
                data: rates,
                fill: true,
                tension: 0.3,
                borderColor: 'rgba(75,192,192,1)',
                backgroundColor: 'rgba(75,192,192,0.2)',
            }]
        };
    }

    public lineChartData: ChartData<'line'> = {
        labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        datasets: [
            {
                data: [1.072, 1.075, 1.073, 1.078, 1.076, 1.081, 1.080], // Example EUR to USD rates
                label: 'EUR to USD Exchange Rate',
                fill: true, // Fills the area under the line
                tension: 0.3, // Makes the line slightly curved
                borderColor: 'rgba(75,192,192,1)',
                backgroundColor: 'rgba(75,192,192,0.2)',
            },
        ],
    };

    // Chart Options
    public lineChartOptions: ChartOptions<'line'> = {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: 'EUR to USD Exchange Rate - Last 7 Days', // Chart title
            },
        },
    };
}
