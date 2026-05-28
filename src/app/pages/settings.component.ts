import { Component, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MinerService } from '../services/miner.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Einstellungen</h1>
          <p class="page-subtitle">Passe das Dashboard an deine Bedürfnisse an und verwalte deine Daten.</p>
        </div>
      </div>

      <div class="settings-grid">
        
        <!-- Allgemein -->
        <div class="settings-card">
          <div class="card-header">
            <div class="icon-wrapper bg-indigo">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </div>
            <h2 class="card-title">Allgemein</h2>
          </div>
          <div class="card-body">
            <div class="setting-item">
              <div class="setting-info">
                <h3>Aktualisierungs-Intervall</h3>
                <p>Wie oft sollen die Live-Daten der Miner im Netzwerk abgerufen werden?</p>
              </div>
              <div class="setting-action">
                <select class="form-select" [value]="minerService.settings().refreshInterval" (change)="onIntervalChange($event)">
                  <option [value]="5000">Alle 5 Sekunden</option>
                  <option [value]="10000">Alle 10 Sekunden (Standard)</option>
                  <option [value]="30000">Alle 30 Sekunden</option>
                  <option [value]="60000">Jede Minute</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Datenverwaltung -->
        <div class="settings-card">
          <div class="card-header">
            <div class="icon-wrapper bg-emerald">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            </div>
            <h2 class="card-title">Datenverwaltung (Backup)</h2>
          </div>
          <div class="card-body">
            <div class="setting-item">
              <div class="setting-info">
                <h3>Miner exportieren</h3>
                <p>Lade deine eingetragenen Miner als Backup-Datei (.json) herunter, um sie auf einem anderen Gerät zu nutzen.</p>
              </div>
              <div class="setting-action">
                <button class="btn-primary" (click)="minerService.exportData()">Backup herunterladen</button>
              </div>
            </div>

            <div class="divider"></div>

            <div class="setting-item">
              <div class="setting-info">
                <h3>Miner importieren</h3>
                <p>Stelle deine Miner aus einer vorherigen Backup-Datei wieder her. (Bisherige Daten werden überschrieben!)</p>
              </div>
              <div class="setting-action">
                <!-- Verstecktes Datei-Inputfeld -->
                <input type="file" accept=".json" #fileInput (change)="onFileSelected($event)" style="display: none;">
                <button class="btn-secondary" (click)="fileInput.click()">Backup hochladen</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Gefahrenzone -->
        <div class="settings-card danger-zone">
          <div class="card-header">
            <div class="icon-wrapper bg-danger">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </div>
            <h2 class="card-title text-danger">Gefahrenzone</h2>
          </div>
          <div class="card-body">
            <div class="setting-item">
              <div class="setting-info">
                <h3 class="text-danger">Alle Daten löschen</h3>
                <p>Setzt das Dashboard komplett zurück. Alle eingetragenen Miner und Logs werden unwiderruflich aus deinem Browser gelöscht.</p>
              </div>
              <div class="setting-action">
                <button class="btn-danger" (click)="onReset()">Zurücksetzen</button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 0 2rem 2rem 2rem; max-width: 1000px; margin: 0 auto; animation: fadeIn 0.3s ease-out; }
    .page-header { margin-bottom: 2rem; }
    .page-title { font-size: 2rem; margin-bottom: 0.5rem; }
    .page-subtitle { color: var(--text-muted); font-size: 1rem; }
    
    .settings-grid { display: flex; flex-direction: column; gap: 1.5rem; }
    
    .settings-card { background: var(--bg-surface); border-radius: var(--radius-lg); padding: 1.5rem 2rem; box-shadow: var(--shadow-sm); }
    .settings-card.danger-zone { border: 1px solid #FEE2E2; }
    
    .card-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
    .icon-wrapper { width: 40px; height: 40px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; }
    .bg-indigo { background-color: #E0E7FF; color: #4F46E5; }
    .bg-emerald { background-color: #D1FAE5; color: #10B981; }
    .bg-danger { background-color: #FEE2E2; color: #EF4444; }
    
    .card-title { font-size: 1.25rem; margin: 0; }
    .text-danger { color: var(--danger); }
    
    .card-body { display: flex; flex-direction: column; gap: 1.5rem; }
    
    .setting-item { display: flex; justify-content: space-between; align-items: center; gap: 2rem; }
    @media (max-width: 768px) {
      .setting-item { flex-direction: column; align-items: flex-start; gap: 1rem; }
      .setting-action { width: 100%; }
      .setting-action button, .setting-action select { width: 100%; }
    }
    
    .setting-info h3 { font-size: 1rem; font-weight: 600; margin-bottom: 0.25rem; }
    .setting-info p { font-size: 0.875rem; color: var(--text-muted); margin: 0; }
    
    .divider { height: 1px; background-color: #E5E7EB; width: 100%; }
    
    .form-select { padding: 0.625rem 1rem; border-radius: var(--radius-md); border: 1px solid #E5E7EB; background-color: var(--bg-main); font-family: inherit; font-size: 0.9rem; font-weight: 500; cursor: pointer; outline: none; transition: all 0.2s; min-width: 200px; }
    .form-select:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-light); background-color: var(--bg-surface); }
    
    .btn-primary, .btn-secondary, .btn-danger { padding: 0.625rem 1.25rem; border-radius: var(--radius-full); font-weight: 600; font-family: inherit; cursor: pointer; transition: all 0.2s; border: none; display: inline-flex; align-items: center; justify-content: center; white-space: nowrap; }
    
    .btn-primary { background-color: var(--primary); color: white; box-shadow: 0 4px 6px rgba(79, 70, 229, 0.2); }
    .btn-primary:hover { background-color: var(--primary-hover); transform: translateY(-1px); }
    
    .btn-secondary { background-color: var(--bg-main); color: var(--text-main); }
    .btn-secondary:hover { background-color: #E5E7EB; }
    
    .btn-danger { background-color: #FEE2E2; color: var(--danger); font-weight: 700; }
    .btn-danger:hover { background-color: var(--danger); color: white; }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class SettingsComponent {
  minerService = inject(MinerService);

  onIntervalChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const ms = parseInt(select.value, 10);
    this.minerService.updateRefreshInterval(ms);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const success = this.minerService.importData(content);
        if (success) {
          alert('Miner-Daten wurden erfolgreich importiert!');
        } else {
          alert('Fehler beim Importieren: Ungültiges Dateiformat.');
        }
        // Input zurücksetzen, damit gleiche Datei nochmal ausgewählt werden kann
        input.value = '';
      };
      
      reader.readAsText(file);
    }
  }

  onReset() {
    if (confirm('ACHTUNG: Möchtest du wirklich alle Miner und Daten aus deinem Browser löschen? Dieser Schritt kann nicht rückgängig gemacht werden!')) {
      this.minerService.resetAllData();
      alert('Alle Daten wurden erfolgreich gelöscht.');
    }
  }
}