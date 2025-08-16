import { Component, HostListener, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./components/feature/navbar/navbar.component";
import { HistoryService } from './services/history-service/history.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private historyService = inject(HistoryService);

  @HostListener('window:beforeunload', ['$event'])
  updateHistoryToLocalStorage($event: any): void {
    this.historyService.saveHistoryToLocalStorage();
  }
}
