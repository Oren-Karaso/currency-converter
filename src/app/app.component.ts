import { Component, HostListener, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./components/feature/navbar/navbar.component";
import { CurrencyService } from './services/currency.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private currencyService = inject(CurrencyService);

  @HostListener('window:beforeunload', ['$event'])
  updateHistoryToLocalStorage($event: any): void {
    this.currencyService.saveHistoryToLocalStorage();
  }
}
