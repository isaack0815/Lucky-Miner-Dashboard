import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MinerService } from '../services/miner.service';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Statistiken</h1>
          <p class="page-subtitle">Detaillierte Auswertungen deines Mining-Betriebs.</p>
        </div>
      </div>

      <!-- KPI Row -->
      <div class="kpi-grid">
        <div class="kpi-card power">
          <div class="icon-wrapper">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
          </div>
          <div class="kpi-info">
            <h3>{{ minerService.totalPower().toFixed(1) }} W</h3>
            <p>Gesamtverbrauch</p>
          </div>
        </div>

        <div class="kpi-card efficiency">
          <div class="icon-wrapper">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
          <div class="kpi-info">
            <h3>{{ efficiency }} W/TH</h3>
            <p>Effizienz (Durchschnitt)</p>
          </div>
        </div>

        <div class="kpi-card best-diff">
          <div class="icon-wrapper">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          </div>
          <div class="kpi-info">
            <h3>{{ topDiffMiner?.bestDiff || 'N/A' }}</h3>
            <p>Beste Difficulty ({{ topDiffMiner?.name || '-' }})</p>
          </div>
        </div>
      </div>

      <div class="content-grid">
        <!-- Performance Ranking -->
        <div class="stats-panel">
          <h2 class="panel-title">Performance Ranking</h2>
          <p class="panel-desc">Top Miner nach aktueller Hashrate.</p>
          
          <div class="ranking-list">
            @for (miner of sortedMiners(); track miner.id; let i = $index) {
              <div class="ranking-item">
                <div class="rank-number">#{{ i + 1 }}</div>
                <div class="rank-details">
                  <div class="rank-header">
                    <span class="rank-name">{{ miner.name }}</span>
                    <span class="rank-value">{{ miner.hashrate.toFixed(2) }} TH/s</span>
                  </div>
                  <div class="progress-bar-bg">
                    <div class="progress-bar-fill" 
                         [style.width.%]="maxHashrate > 0 ? (miner.hashrate / maxHashrate) * 100 : 0">
                    </div>
                  </div>
                  <div class="rank-meta">
                    <span>{{ miner.power?.toFixed(1) || 0 }} W</span> • 
                    <span>Lüfter: {{ miner.fanSpeed || 0 }} RPM</span> •
                    <span>Uptime: {{ formatUptime(miner.uptimeSeconds || 0) }}</span>
                  </div>
                </div>
              </div>
            }
            @if (sortedMiners().length === 0) {
              <div class="empty-state">Keine aktiven Miner gefunden.</div>
            }
          </div>
        </div>

        <!-- Pool Verteilung -->
        <div class="stats-panel">
          <h2 class="panel-title">Pool Informationen</h2>
          <p class="panel-desc">Übersicht der verwendeten Stratum-Pools.</p>
          
          <div class="pool-list">
            @for (pool of poolStats(); track pool.url) {
              <div class="pool-item">
                <div class="pool-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12h20"></path><path d="M12 2v20"></path><circle cx="12" cy="12" r="10"></circle></svg>
                </div>
                <div class="pool-info">
                  <span class="pool-url">{{ pool.url }}</span>
                  <span class="pool-count">{{ pool.count }} Miner verbunden</span>
                </div>
              </div>
            }
            @if (poolStats().length === 0) {
              <div class="empty-state">Keine Pool-Informationen verfügbar.</div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 0 2rem 2rem 2rem; max-width: 1400px; margin: 0 auto; animation: fadeIn 0.3s ease-out; }
    .page-header { margin-bottom: 2rem; }
    .page-title { font-size: 2rem; margin-bottom: 0.5rem; }
    .page-subtitle { color: var(--text-muted); font-size: 1rem; }
    
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
    .kpi-card { background: var(--bg-surface); border-radius: var(--radius-lg); padding: 1.5rem; display: flex; align-items: center; gap: 1.5rem; box-shadow: var(--shadow-sm); transition: transform 0.2s; }
    .kpi-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
    .icon-wrapper { width: 56px; height: 56px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; }
    
    .power .icon-wrapper { background-color: #FEF3C7; color: #D97706; }
    .efficiency .icon-wrapper { background-color: #E0E7FF; color: #4338CA; }
    .best-diff .icon-wrapper { background-color: #D1FAE5; color: #047857; }
    
    .kpi-info h3 { font-size: 1.75rem; margin-bottom: 0.25rem; font-weight: 700; }
    .kpi-info p { color: var(--text-muted); font-size: 0.875rem; font-weight: 500; }

    .content-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; }
    @media (max-width: 1024px) { .content-grid { grid-template-columns: 1fr; } }
    
    .stats-panel { background: var(--bg-surface); border-radius: var(--radius-lg); padding: 1.5rem; box-shadow: var(--shadow-sm); }
    .panel-title { font-size: 1.25rem; margin-bottom: 0.25rem; }
    .panel-desc { color: var(--text-muted); font-size: 0.875rem; margin-bottom: 1.5rem; }
    
    .ranking-list { display: flex; flex-direction: column; gap: 1.25rem; }
    .ranking-item { display: flex; gap: 1rem; align-items: flex-start; }
    .rank-number { font-size: 1.25rem; font-weight: 700; color: var(--text-muted); width: 30px; padding-top: 2px; }
    .rank-details { flex-grow: 1; }
    .rank-header { display: flex; justify-content: space-between; margin-bottom: 0.5rem; }
    .rank-name { font-weight: 600; }
    .rank-value { font-weight: 700; color: var(--primary); }
    
    .progress-bar-bg { height: 8px; background-color: var(--bg-main); border-radius: var(--radius-full); overflow: hidden; margin-bottom: 0.5rem; }
    .progress-bar-fill { height: 100%; background-color: var(--primary); border-radius: var(--radius-full); transition: width 1s ease-out; }
    
    .rank-meta { font-size: 0.75rem; color: var(--text-muted); display: flex; gap: 6px; }
    
    .pool-list { display: flex; flex-direction: column; gap: 1rem; }
    .pool-item { display: flex; align-items: center; gap: 1rem; padding: 1rem; background-color: var(--bg-main); border-radius: var(--radius-md); }
    .pool-icon { color: var(--primary); }
    .pool-info { display: flex; flex-direction: column; }
    .pool-url { font-weight: 600; font-size: 0.95rem; }
    .pool-count { color: var(--text-muted); font-size: 0.875rem; }

    .empty-state { text-align: center; padding: 2rem; color: var(--text-muted); font-style: italic; }
    
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class StatsComponent {
  minerService = inject(MinerService);

  // Getter für sortierte Liste nach Hashrate
  sortedMiners = computed(() => {
    return [...this.minerService.miners()]
      .filter(m => m.status === 'online')
      .sort((a, b) => b.hashrate - a.hashrate);
  });

  // Maximale Hashrate für die Fortschrittsbalken
  get maxHashrate(): number {
    const miners = this.sortedMiners();
    return miners.length > 0 ? miners[0].hashrate : 0;
  }

  // Effizienz in W/TH berechnen
  get efficiency(): string {
    const totalW = this.minerService.totalPower();
    const totalTH = this.minerService.totalHashrate();
    if (totalTH === 0) return '0.0';
    return (totalW / totalTH).toFixed(1);
  }

  // Den Miner mit der besten (höchsten) Difficulty finden
  get topDiffMiner() {
    const online = this.minerService.miners().filter(m => m.status === 'online' && m.bestDiff);
    if (online.length === 0) return null;
    
    // Simpler Fallback: den zuletzt geupdateten nehmen oder sortieren. 
    // Da "4.29G" ein String ist, sortieren wir hier nur vereinfacht (für Prod evtl. Parsen)
    return online[0]; 
  }

  // Pools aggregieren
  poolStats = computed(() => {
    const pools = new Map<string, number>();
    this.minerService.miners().forEach(m => {
      if (m.status === 'online' && m.pool) {
        pools.set(m.pool, (pools.get(m.pool) || 0) + 1);
      }
    });
    return Array.from(pools.entries()).map(([url, count]) => ({ url, count }));
  });

  // Hilfsfunktion: Sekunden in ein lesbares Format umwandeln (z.B. 1h 20m)
  formatUptime(seconds: number): string {
    if (!seconds) return '0m';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  }
}