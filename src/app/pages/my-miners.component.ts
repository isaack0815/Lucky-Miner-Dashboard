import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MinerService } from '../services/miner.service';
import { AddMinerModalComponent } from '../components/add-miner-modal.component';
import { EditMinerModalComponent } from '../components/edit-miner-modal.component';
import { Miner } from '../models/miner.model';

@Component({
  selector: 'app-my-miners',
  standalone: true,
  imports: [CommonModule, AddMinerModalComponent, EditMinerModalComponent],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Meine Miner</h1>
          <p class="page-subtitle">Verwalte und steuere deine LuckyMiner.</p>
        </div>
        <button class="btn-primary" (click)="openAddModal()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Miner hinzufügen
        </button>
      </div>

      @if (minerService.miners().length === 0) {
        <div class="empty-state">
          <div class="empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
          </div>
          <h2>Keine Miner gefunden</h2>
          <p>Du hast noch keine Miner hinzugefügt. Klicke auf den Button oben rechts, um zu starten.</p>
        </div>
      } @else if (minerService.filteredMiners().length === 0) {
        <div class="empty-state search-empty">
          <div class="empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          <h2>Keine Treffer</h2>
          <p>Es wurden keine Miner für den Suchbegriff <strong>"{{ minerService.searchTerm() }}"</strong> gefunden.</p>
          <button class="btn-secondary mt-4" (click)="minerService.searchTerm.set('')">Suche zurücksetzen</button>
        </div>
      } @else {
        <div class="miner-grid">
          @for (miner of minerService.filteredMiners(); track miner.id) {
            <div class="miner-card">
              <div class="card-header">
                <div class="miner-title-wrapper">
                  <div class="status-indicator" [class.offline]="miner.status === 'offline'" [class.online]="miner.status === 'online'"></div>
                  <h3 class="miner-name">{{ miner.name }}</h3>
                </div>
                <span class="badge">{{ miner.model }}</span>
              </div>
              
              <div class="miner-details">
                <div class="detail-row">
                  <span class="detail-label">IP-Adresse</span>
                  <span class="detail-value font-mono">{{ miner.ipAddress }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Status</span>
                  <span class="detail-value" [class.text-muted]="miner.status === 'offline'" [class.text-success]="miner.status === 'online'">
                    {{ miner.status === 'offline' ? 'Offline' : 'Online' }}
                  </span>
                </div>
                <div class="divider"></div>
                <div class="stats-row">
                  <div class="stat-mini">
                    <span class="stat-mini-label">Hashrate</span>
                    <span class="stat-mini-value">{{ miner.hashrate.toFixed(2) }} TH/s</span>
                  </div>
                  <div class="stat-mini">
                    <span class="stat-mini-label">Temp</span>
                    <span class="stat-mini-value">{{ miner.temp }} °C</span>
                  </div>
                  <div class="stat-mini">
                    <span class="stat-mini-label">Shares</span>
                    <span class="stat-mini-value">{{ miner.shares }}</span>
                  </div>
                </div>
              </div>

              <div class="card-actions">
                <!-- Restart Button -->
                <button class="btn-action" title="Miner neu starten" (click)="restart(miner.id, miner.name)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
                </button>
                
                <!-- Identify Button -->
                <button class="btn-action" title="Miner identifizieren (Display blinkt)" (click)="identify(miner.id, miner.name)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                </button>

                <!-- Einstellungen/Bearbeiten Button -->
                <button class="btn-action" title="Einstellungen bearbeiten" (click)="openEditModal(miner)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                </button>

                <div class="flex-spacer"></div>
                <button class="btn-action danger" title="Löschen" (click)="deleteMiner(miner.id)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            </div>
          }
        </div>
      }
    </div>

    @if (showAddModal) {
      <app-add-miner-modal (close)="closeAddModal()"></app-add-miner-modal>
    }

    @if (selectedMinerToEdit) {
      <app-edit-miner-modal 
        [miner]="selectedMinerToEdit" 
        (close)="closeEditModal()">
      </app-edit-miner-modal>
    }
  `,
  styles: [`
    .page-container { padding: 0 2rem 2rem 2rem; max-width: 1400px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; }
    .page-title { font-size: 2rem; margin-bottom: 0.5rem; }
    .page-subtitle { color: var(--text-muted); font-size: 1rem; }
    .btn-primary { background-color: var(--primary); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: var(--radius-full); font-weight: 600; font-family: inherit; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; transition: background-color 0.2s; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); }
    .btn-primary:hover { background-color: var(--primary-hover); }
    
    .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 5rem 1rem; text-align: center; background: var(--bg-surface); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); }
    .empty-icon { width: 80px; height: 80px; background: var(--bg-main); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--text-muted); margin-bottom: 1.5rem; }
    .empty-state h2 { margin-bottom: 0.5rem; font-size: 1.5rem; }
    .empty-state p { color: var(--text-muted); max-width: 400px; }
    
    .btn-secondary { background-color: var(--bg-main); color: var(--text-main); border: none; padding: 0.5rem 1rem; border-radius: var(--radius-full); font-weight: 600; font-family: inherit; cursor: pointer; transition: background-color 0.2s; }
    .btn-secondary:hover { background-color: #E5E7EB; }
    .mt-4 { margin-top: 1rem; }

    .miner-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
    .miner-card { background: var(--bg-surface); border-radius: var(--radius-lg); padding: 1.5rem; box-shadow: var(--shadow-sm); display: flex; flex-direction: column; transition: transform 0.2s, box-shadow 0.2s; }
    .miner-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .miner-title-wrapper { display: flex; align-items: center; gap: 12px; }
    .status-indicator { width: 12px; height: 12px; border-radius: 50%; }
    .status-indicator.online { background-color: var(--success); box-shadow: 0 0 0 3px var(--success-light); }
    .status-indicator.offline { background-color: var(--text-muted); box-shadow: 0 0 0 3px #E5E7EB; }
    .miner-name { font-size: 1.25rem; font-weight: 700; }
    .badge { background-color: var(--primary-light); color: var(--primary); padding: 4px 10px; border-radius: var(--radius-full); font-size: 0.75rem; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; }
    .miner-details { flex-grow: 1; display: flex; flex-direction: column; gap: 0.75rem; }
    .detail-row { display: flex; justify-content: space-between; align-items: center; }
    .detail-label { color: var(--text-muted); font-size: 0.875rem; }
    .detail-value { font-weight: 600; font-size: 0.95rem; }
    .font-mono { font-family: monospace; background: var(--bg-main); padding: 2px 6px; border-radius: 4px; }
    .text-muted { color: var(--text-muted); }
    .text-success { color: var(--success); }
    .divider { height: 1px; background-color: #E5E7EB; margin: 0.5rem 0; }
    .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 0.5rem; margin-bottom: 1.5rem; }
    .stat-mini { display: flex; flex-direction: column; gap: 4px; }
    .stat-mini-label { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
    .stat-mini-value { font-weight: 700; font-size: 1.1rem; }
    .card-actions { display: flex; gap: 0.5rem; margin-top: auto; padding-top: 1rem; border-top: 1px solid #E5E7EB; }
    .btn-action { background-color: var(--bg-main); border: none; width: 36px; height: 36px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; color: var(--text-main); cursor: pointer; transition: all 0.2s; }
    .btn-action:hover { background-color: #E5E7EB; }
    .btn-action.danger { color: var(--text-muted); }
    .btn-action.danger:hover { background-color: #FEE2E2; color: var(--danger); }
    .flex-spacer { flex: 1; }
  `]
})
export class MyMinersComponent {
  minerService = inject(MinerService);
  
  showAddModal = false;
  selectedMinerToEdit: Miner | null = null;

  openAddModal() { this.showAddModal = true; }
  closeAddModal() { this.showAddModal = false; }
  
  openEditModal(miner: Miner) { this.selectedMinerToEdit = miner; }
  closeEditModal() { this.selectedMinerToEdit = null; }

  deleteMiner(id: string) { if (confirm('Möchtest du diesen Miner wirklich entfernen?')) { this.minerService.deleteMiner(id); } }

  restart(id: string, name: string) {
    if (confirm(`Soll der Miner "${name}" wirklich neugestartet werden?`)) {
      this.minerService.restartMiner(id);
    }
  }

  identify(id: string, name: string) {
    this.minerService.identifyMiner(id);
    alert(`Identify-Signal an "${name}" gesendet! Das Display sollte nun blinken.`);
  }
}