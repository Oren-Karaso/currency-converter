import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: 'currency-converter', loadComponent: () => import('./components/feature/currency-converter/currency-converter.component').then(m => m.CurrencyConverterComponent) },
    { path: 'history', loadComponent: () => import('./components/feature/history/history.component').then(m => m.HistoryComponent) },
    { path: '**', redirectTo: 'currency-converter' }
];
