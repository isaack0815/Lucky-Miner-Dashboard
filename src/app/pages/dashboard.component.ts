import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <div>
          <h1 class="page-title">Übersicht</h1>
          <p class="page-subtitle">Willkommen zurück! Hier ist der Status deiner Miner.</p>
        </div>
        <button class="btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Miner hinzufügen
        </button>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid">
        
        <!-- Stat Card 1 -->
        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-icon bg-indigo">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            </div>
            <span class="trend positive">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
              +5.2%
            </span>
          </div>
          <div class="stat-content">
            <h3 class="stat-value">4.2 TH/s</h3>
            <p class="stat-label">Gesamte Hashrate</p>
          </div>
        </div>

        <!-- Stat Card 2 -->
        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-icon bg-emerald">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
            </div>
            <span class="trend neutral">
              <span>5 / 5</span>
            </span>
          </div>
          <div class="stat-content">
            <h3 class="stat-value">5 Online</h3>
            <p class="stat-label">Aktive Miner</p>
          </div>
        </div>

        <!-- Stat Card 3 -->
        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-icon bg-amber">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </div>
          </div>
          <div class="stat-content">
            <h3 class="stat-value">12.4k</h3>
            <p class="stat-label">Gefundene Shares (24h)</p>
          </div>
        </div>

        <!-- Stat Card 4 -->
        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-icon bg-danger">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path></svg>
            </div>
            <span class="trend negative">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>
              +1.2°C
            </span>
          </div>
          <div class="stat-content">
            <h3 class="stat-value">54 °C</h3>
            <p class="stat-label">Durchschnittliche Temp.</p>
          </div>
        </div>

      </div>

      <!-- Main Content Area -->
      <div class="dashboard-widgets">
        <div class="widget-card lg-col">
          <h2 class="widget-title">Performance Verlauf</h2>
          <div class="placeholder-chart">
            <p class="text-muted">Hier kommt später ein Chart hin.</p>
          </div>
        </div>
        
        <div class="widget-card">
          <h2 class="widget-title">Letzte Aktivitäten</h2>
          <div class="activity-list">
            <div class="activity-item">
              <div class="activity-dot bg-success"></div>
              <div class="activity-details">
                <p class="activity-desc">Miner "Lucky-01" hat einen Block Share gefunden</p>
                <span class="activity-time">Vor 2 Minuten</span>
              </div>
            </div>
            <div class="activity-item">
              <div class="activity-dot bg-warning"></div>
              <div class="activity-details">
                <p class="activity-desc">Miner "Lucky-03" Temperatur leicht erhöht (62°C)</p>
                <span class="activity-time">Vor 15 Minuten</span>
              </div>
            </div>
            <div class="activity-item">
              <div class="activity-dot bg-success"></div>
              <div class="activity-details">
                <p class="activity-desc">Miner "Lucky-05" erfolgreich gestartet</p>
                <span class="activity-time">Vor 1 Stunde</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 0 2rem 2rem 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 2rem;
    }

    .page-title {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .page-subtitle {
      color: var(--text-muted);
      font-size: 1rem;
    }

    .btn-primary {
      background-color: var(--primary);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: var(--radius-full);
      font-weight: 600;
      font-family: inherit;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      transition: background-color 0.2s;
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
    }

    .btn-primary:hover {
      background-color: var(--primary-hover);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: var(--bg-surface);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      box-shadow: var(--shadow-sm);
    }

    .stat-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .bg-indigo { background: #E0E7FF; color: #4F46E5; }
    .bg-emerald { background: #D1FAE5; color: #10B981; }
    .bg-amber { background: #FEF3C7; color: #F59E0B; }
    .bg-danger { background: #FEE2E2; color: #EF4444; }

    .trend {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.875rem;
      font-weight: 600;
      padding: 4px 8px;
      border-radius: var(--radius-full);
    }

    .trend.positive { background: var(--success-light); color: #065F46; }
    .trend.negative { background: #FEE2E2; color: #991B1B; }
    .trend.neutral { background: var(--bg-main); color: var(--text-muted); }

    .stat-value {
      font-size: 1.75rem;
      margin-bottom: 0.25rem;
    }

    .stat-label {
      color: var(--text-muted);
      font-size: 0.875rem;
      font-weight: 500;
    }

    .dashboard-widgets {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1.5rem;
    }

    @media (max-width: 1024px) {
      .dashboard-widgets {
        grid-template-columns: 1fr;
      }
    }

    .widget-card {
      background: var(--bg-surface);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      box-shadow: var(--shadow-sm);
    }

    .widget-title {
      font-size: 1.25rem;
      margin-bottom: 1.5rem;
    }

    .placeholder-chart {
      height: 250px;
      background: var(--bg-main);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px dashed #E5E7EB;
    }

    .text-muted {
      color: var(--text-muted);
    }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .activity-item {
      display: flex;
      gap: 1rem;
    }

    .activity-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      margin-top: 5px;
      flex-shrink: 0;
    }

    .bg-success { background-color: var(--success); }
    .bg-warning { background-color: var(--warning); }

    .activity-desc {
      font-weight: 500;
      font-size: 0.95rem;
      margin-bottom: 0.25rem;
    }

    .activity-time {
      font-size: 0.8rem;
      color: var(--text-muted);
    }
  `]
})
export class DashboardComponent {}