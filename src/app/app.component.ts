import { Component, inject } from '@angular/core';
import { SidebarComponent } from './components/sidebar.component';
import { HeaderComponent } from './components/header.component';
import { DashboardComponent } from './pages/dashboard.component';
import { MyMinersComponent } from './pages/my-miners.component';
import { NavigationService } from './services/navigation.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SidebarComponent, HeaderComponent, DashboardComponent, MyMinersComponent],
  template: `
    <div class="app-layout">
      <app-sidebar></app-sidebar>
      <div class="main-wrapper">
        <app-header></app-header>
        <main class="content-area">
          @switch (nav.currentView()) {
            @case ('dashboard') {
              <app-dashboard></app-dashboard>
            }
            @case ('miners') {
              <app-my-miners></app-my-miners>
            }
            @default {
              <div style="padding: 2rem; text-align: center; color: var(--text-muted);">
                <h2>Seite im Aufbau</h2>
                <p>Dieser Bereich wird demnächst verfügbar sein.</p>
              </div>
            }
          }
        </main>
      </div>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      min-height: 100vh;
      width: 100%;
      background-color: var(--bg-main);
    }

    .main-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
    }

    .content-area {
      flex: 1;
      overflow-y: auto;
      padding-bottom: 2rem;
    }

    /* Scrollbar Styling for webkit */
    .content-area::-webkit-scrollbar {
      width: 8px;
    }
    .content-area::-webkit-scrollbar-track {
      background: transparent;
    }
    .content-area::-webkit-scrollbar-thumb {
      background-color: rgba(0,0,0,0.1);
      border-radius: var(--radius-full);
    }
  `]
})
export class AppComponent {
  title = 'LuckyMiner Dashboard';
  nav = inject(NavigationService);
}