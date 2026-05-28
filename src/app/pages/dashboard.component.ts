import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MinerService } from '../services/miner.service';
import { AddMinerModalComponent } from '../components/add-miner-modal.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, AddMinerModalComponent],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <div>
          <h1 class="page-title">Übersicht</h1>
          <p class="page-subtitle">Echtzeit-Daten deiner ESP-Miner basierten LuckyMiner.</p>
        </div>
        <button class="btn-primary" (click)="openAddModal()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Miner hinzufügen
        </button>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid">
        
        <!-- Total Hashrate -->
        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-icon bg-indigo">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            </div>
          </div>
          <div class="stat-content">
            <h3 class="stat-value">{{ minerService.totalHashrate().toFixed(2) }} TH/s</h3>
            <p class="stat-label">Gesamte Hashrate</p>
          </div>
        </div>

        <!-- Online Status -->
        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-icon bg-emerald">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
            </div>
            <span class="trend neutral">
              <span>{{ minerService.onlineMiners() }} / {{ minerService.totalMiners() }}</span>
            </span>
          </div>
          <div class="stat-content">
            <h3 class="stat-value">{{ minerService.onlineMiners() }} Online</h3>
            <p class="stat-label">Aktive Miner</p>
          </div>
        </div>

        <!-- Total Shares -->
        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-icon bg-amber">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </div>
          </div>
          <div class="stat-content">
            <h3 class="stat-value">{{ minerService.totalShares() }}</h3>
            <p class="stat-label">Gefundene Shares</p>
          </div>
        </div>

        <!-- Average Temp -->
        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-icon bg-danger">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path></svg>
            </div>
          </div>
          <div class="stat-content">
            <h3 class="stat-value">{{ minerService.avgTemp() }} °C</h3>
            <p class="stat-label">Durchschnittliche Temp.</p>
          </div>
        </div>

      </div>

      <!-- Main Content Area -->
      <div class="dashboard-widgets">
        <div class="widget-card lg-col">
          <h2 class="widget-title">Meine Miner</h2>
          
          @if (minerService.miners().length === 0) {
            <div class="empty-state">
              <div class="empty-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
              </div>
              <h3>Keine Miner vorhanden</h3>
              <p>Füge deinen ersten Miner hinzu, um Live-Daten abzurufen.</p>
              <button class="btn-primary mt-4" (click)="openAddModal()">Miner hinzufügen</button>
            </div>
          } @else {
            <div class="miner-list">
              @for (miner of minerService.miners(); track miner.id) {
                <div class="miner-item">
                  <div class="miner-info">
                    <div class="status-indicator" [class.offline]="miner.status === 'offline'"></div>
                    <div>
                      <h4 class="miner-name">{{ miner.name }}</h4>
                      <p class="miner-ip">{{ miner.ipAddress }} • {{ miner.hashrate.toFixed(2) }} TH/s</p>
                    </div>
                  </div>
                  <div class="miner-actions">
                    <button class="btn-icon" (click)="deleteMiner(miner.id)" title="Miner entfernen">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  </div>
                </div>
              }
            </div>
          }
        </div>
        
        <div class="widget-card">
          <h2 class="widget-title">Share-Protokoll</h2>
          <div class="activity-list">
            @if (minerService.shareLogs().length === 0) {
              <div class="text-muted" style="text-align: center; padding: 2rem 0;">
                <svg style="margin: 0 auto 10px auto; opacity: 0.5" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                <br>Warte auf neue Shares...
              </div>
            } @else {
              <div class="logs-container">
                @for (log of minerService.shareLogs(); track log.id) {
                  <div class="log-item">
                    <div class="log-time">{{ log.timestamp | date:'HH:mm:ss' }}</div>
                    <div class="log-content">
                      <strong>{{ log.minerName }}</strong> hat 
                      <span class="share-highlight">+{{ log.sharesAdded }} Share{{ log.sharesAdded > 1 ? 's' : '' }}</span> 
                      gefunden.
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </div>
    </div>

    @if (showAddModal) {
      <app-add-miner-modal (closeModal)="closeAddModal()"></app-add-miner-modal>
    }
  `,
  styles: [`
    .dashboard-container { padding: 0 2rem 2rem 2rem; max-width: 1400px; margin: 0 auto; }
    .dashboard-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; }
    .page-title { font-size: 2rem; margin-bottom: 0.5rem; }
    .page-subtitle { color: var(--text-muted); font-size: 1rem; }
    .btn-primary { background-color: var(--primary); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: var(--radius-full); font-weight: 600; font-family: inherit; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; transition: background-color 0.2s; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); }
    .mt-4 { margin-top: 1rem; }
    .btn-primary:hover { background-color: var(--primary-hover); }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
    .stat-card { background: var(--bg-surface); border-radius: var(--radius-lg); padding: 1.5rem; box-shadow: var(--shadow-sm); }
    .stat-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
    .stat-icon { width: 48px; height: 48px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; }
    .bg-indigo { background: #E0E7FF; color: #4F46E5; }
    .bg-emerald { background: #D1FAE5; color: #10B981; }
    .bg-amber { background: #FEF3C7; color: #F59E0B; }
    .bg-danger { background: #FEE2E2; color: #EF4444; }
    .trend { display: flex; align-items: center; gap: 4px; font-size: 0.875rem; font-weight: 600; padding: 4px 8px; border-radius: var(--radius-full); }
    .trend.positive { background: var(--success-light); color: #065F46; }
    .trend.negative { background: #FEE2E2; color: #991B1B; }
    .trend.neutral { background: var(--bg-main); color: var(--text-muted); }
    .stat-value { font-size: 1.75rem; margin-bottom: 0.25rem; }
    .stat-label { color: var(--text-muted); font-size: 0.875rem; font-weight: 500; }
    .dashboard-widgets { display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; }
    @media (max-width: 1024px) { .dashboard-widgets { grid-template-columns: 1fr; } }
    .widget-card { background: var(--bg-surface); border-radius: var(--radius-lg); padding: 1.5rem; box-shadow: var(--shadow-sm); display: flex; flex-direction: column; }
    .widget-title { font-size: 1.25rem; margin-bottom: 1.5rem; }
    
    /* Leerer Zustand & Listen */
    .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem 1rem; text-align: center; background: var(--bg-main); border-radius: var(--radius-md); border: 2px dashed #E5E7EB; flex-grow: 1; }
    .empty-icon { width: 64px; height: 64px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--text-muted); margin-bottom: 1rem; box-shadow: var(--shadow-sm); }
    .empty-state h3 { margin-bottom: 0.5rem; }
    .empty-state p { color: var(--text-muted); }
    
    .miner-list { display: flex; flex-direction: column; gap: 1rem; }
    .miner-item { display: flex; justify-content: space-between; align-items: center; padding: 1rem; background-color: var(--bg-main); border-radius: var(--radius-md); transition: transform 0.2s; }
    .miner-item:hover { transform: translateY(-2px); box-shadow: var(--shadow-sm); }
    .miner-info { display: flex; align-items: center; gap: 1rem; }
    .status-indicator { width: 12px; height: 12px; border-radius: 50%; background-color: var(--success); box-shadow: 0 0 0 3px var(--success-light); }
    .status-indicator.offline { background-color: var(--text-muted); box-shadow: 0 0 0 3px #E5E7EB; }
    .miner-name { font-weight: 600; font-size: 1rem; margin-bottom: 0.25rem; }
    .miner-ip { font-size: 0.875rem; color: var(--text-muted); }
    .btn-icon { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 8px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
    .btn-icon:hover { background-color: #FEE2E2; color: var(--danger); }
    .text-muted { color: var(--text-muted); }

    /* Neues Log Styling */
    .activity-list { flex-grow: 1; overflow: hidden; display: flex; flex-direction: column; }
    .logs-container { max-height: 400px; overflow-y: auto; display: flex; flex-direction: column; gap: 0.75rem; padding-right: 5px; }
    .logs-container::-webkit-scrollbar { width: 4px; }
    .logs-container::-webkit-scrollbar-track { background: transparent; }
    .logs-container::-webkit-scrollbar-thumb { background-color: #E5E7EB; border-radius: 10px; }
    
    .log-item { display: flex; gap: 12px; padding: 10px; background-color: var(--bg-main); border-radius: var(--radius-md); font-size: 0.875rem; animation: slideIn 0.3s ease-out; }
    .log-time { color: var(--text-muted); font-family: monospace; font-weight: 600; flex-shrink: 0; }
    .log-content { color: var(--text-main); }
    .share-highlight { color: #D97706; font-weight: 700; background-color: #FEF3C7; padding: 2px 6px; border-radius: 4px; }

    @keyframes slideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
  `]
})
export class DashboardComponent {
  minerService = inject(MinerService);
  showAddModal = false;

  openAddModal() { this.showAddModal = true; }
  closeAddModal() { this.showAddModal = false; }
  deleteMiner(id: string) { if (confirm('Möchtest du diesen Miner wirklich entfernen?')) { this.minerService.deleteMiner(id); } }
}