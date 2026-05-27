import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MinerService } from '../services/miner.service';
import { Miner } from '../models/miner.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-edit-miner-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-backdrop" (click)="close.emit()">
      <div class="modal-card" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2 class="modal-title">Miner bearbeiten</h2>
          <button class="close-btn" (click)="close.emit()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <form [formGroup]="editForm" (ngSubmit)="onSubmit()">
          
          <!-- LOKALE EINSTELLUNGEN -->
          <h3 class="section-title">Lokale Anzeige</h3>
          <div class="form-row">
            <div class="form-group flex-1">
              <label for="name">Name des Miners</label>
              <input type="text" id="name" formControlName="name" class="form-input">
            </div>
            <div class="form-group flex-1">
              <label for="ipAddress">IP-Adresse</label>
              <input type="text" id="ipAddress" formControlName="ipAddress" class="form-input">
            </div>
          </div>

          <div class="form-group">
            <label for="model">Modell</label>
            <select id="model" formControlName="model" class="form-input">
              <option value="v06">LuckyMiner v06</option>
              <option value="v07">LuckyMiner v07</option>
              <option value="v08">LuckyMiner v08</option>
              <option value="other">Anderes Modell (Eigene Eingabe)</option>
            </select>
          </div>

          @if (editForm.get('model')?.value === 'other') {
            <div class="form-group" style="animation: fadeIn 0.2s ease-out;">
              <label for="customModel">Eigener Modellname</label>
              <input type="text" id="customModel" formControlName="customModel" class="form-input">
            </div>
          }

          <div class="divider"></div>

          <!-- HARDWARE EINSTELLUNGEN (POOL) -->
          <h3 class="section-title">Pool-Konfiguration</h3>
          
          @if (isLoadingPool) {
            <div class="status-box loading">
              <div class="spinner"></div> Lade Hardware-Einstellungen...
            </div>
          } @else if (loadError) {
            <div class="status-box error flex-col">
              <div class="error-text">
                <strong>Direktabfrage blockiert (CORS / Firmware).</strong><br>
                Deine Miner-Firmware unterstützt diese API leider nicht direkt. Du kannst die Pool-Einstellungen stattdessen in der Weboberfläche des Miners ändern.
              </div>
              <a [href]="'http://' + miner.ipAddress" target="_blank" class="btn-external">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                Miner-Webinterface öffnen
              </a>
            </div>
          } @else {
            <div class="form-group">
              <label for="poolUrl">Pool URL</label>
              <input type="text" id="poolUrl" formControlName="poolUrl" class="form-input" placeholder="z.B. eu.luckyminer.io">
            </div>
            
            <div class="form-row">
              <div class="form-group flex-1">
                <label for="poolPort">Port</label>
                <input type="number" id="poolPort" formControlName="poolPort" class="form-input" placeholder="3333">
              </div>
            </div>

            <div class="form-group">
              <label for="poolUser">Worker / BTC Adresse</label>
              <input type="text" id="poolUser" formControlName="poolUser" class="form-input" placeholder="bc1q...">
            </div>

            <div class="form-group">
              <label for="poolPassword">Passwort (Optional)</label>
              <input type="text" id="poolPassword" formControlName="poolPassword" class="form-input" placeholder="x">
            </div>
          }

          <div class="modal-footer">
            <button type="button" class="btn-secondary" (click)="close.emit()">Abbrechen</button>
            <button type="submit" class="btn-primary" [disabled]="editForm.invalid || isSaving">
              {{ isSaving ? 'Speichert...' : 'Lokale Änderungen speichern' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background-color: rgba(17, 24, 39, 0.4); backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center; z-index: 1000;
      animation: fadeIn 0.2s ease-out; padding: 1rem;
    }
    .modal-card {
      background-color: var(--bg-surface); width: 100%; max-width: 540px;
      max-height: 90vh; overflow-y: auto;
      border-radius: var(--radius-lg); box-shadow: var(--shadow-lg); padding: 2rem;
      animation: slideUp 0.3s ease-out;
    }
    
    .modal-card::-webkit-scrollbar { width: 6px; }
    .modal-card::-webkit-scrollbar-track { background: transparent; }
    .modal-card::-webkit-scrollbar-thumb { background-color: #E5E7EB; border-radius: 10px; }

    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .modal-title { font-size: 1.25rem; font-weight: 700; }
    .close-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px; border-radius: var(--radius-sm); transition: all 0.2s; }
    .close-btn:hover { background-color: var(--bg-main); color: var(--text-main); }
    
    .section-title { font-size: 0.95rem; font-weight: 700; color: var(--text-main); margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.5px; }
    .divider { height: 1px; background-color: #E5E7EB; margin: 1.5rem 0; }
    
    .form-row { display: flex; gap: 1rem; }
    .flex-1 { flex: 1; }
    .form-group { margin-bottom: 1.25rem; }
    
    label { display: block; font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--text-main); }
    .form-input { width: 100%; padding: 0.75rem 1rem; border: 1px solid #E5E7EB; border-radius: var(--radius-md); font-family: inherit; font-size: 0.95rem; background-color: var(--bg-main); transition: all 0.2s; outline: none; }
    .form-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-light); background-color: var(--bg-surface); }
    
    .status-box { padding: 1rem; border-radius: var(--radius-md); font-size: 0.875rem; display: flex; align-items: center; gap: 10px; margin-bottom: 1.25rem; }
    .status-box.loading { background-color: var(--bg-main); color: var(--text-muted); }
    .status-box.error { background-color: #FEE2E2; color: #991B1B; border: 1px solid #FCA5A5; }
    .flex-col { flex-direction: column; align-items: flex-start; gap: 1rem; }
    .error-text { line-height: 1.5; }
    
    .btn-external { display: inline-flex; align-items: center; gap: 8px; background-color: white; color: #991B1B; padding: 0.5rem 1rem; border-radius: var(--radius-md); text-decoration: none; font-weight: 600; box-shadow: 0 1px 2px rgba(0,0,0,0.05); transition: all 0.2s; border: 1px solid #FCA5A5; }
    .btn-external:hover { background-color: #FEF2F2; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }

    .spinner { width: 16px; height: 16px; border: 2px solid rgba(0,0,0,0.1); border-left-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite; }
    
    .modal-footer { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #E5E7EB; }
    .btn-secondary { padding: 0.75rem 1.25rem; border: none; background-color: var(--bg-main); color: var(--text-main); border-radius: var(--radius-full); font-weight: 600; cursor: pointer; transition: background-color 0.2s; }
    .btn-secondary:hover { background-color: #E5E7EB; }
    .btn-primary { padding: 0.75rem 1.5rem; border: none; background-color: var(--primary); color: white; border-radius: var(--radius-full); font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .btn-primary:hover:not(:disabled) { background-color: var(--primary-hover); box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  `]
})
export class EditMinerModalComponent implements OnInit {
  @Input() miner!: Miner;
  @Output() close = new EventEmitter<void>();
  
  editForm!: FormGroup;
  
  isLoadingPool = true;
  loadError = false;
  isSaving = false;

  constructor(private fb: FormBuilder, private minerService: MinerService) {}

  ngOnInit() {
    const isStandardModel = ['v06', 'v07', 'v08'].includes(this.miner.model);
    
    this.editForm = this.fb.group({
      // Lokale Anzeige-Daten
      name: [this.miner.name, Validators.required],
      ipAddress: [this.miner.ipAddress, [Validators.required, Validators.pattern('^([0-9]{1,3}\\.){3}[0-9]{1,3}$')]],
      model: [isStandardModel ? this.miner.model : 'other', Validators.required],
      customModel: [isStandardModel ? '' : this.miner.model],
      
      // Hardware-Daten (Pool)
      poolUrl: [''],
      poolPort: [''],
      poolUser: [''],
      poolPassword: ['']
    });

    this.fetchHardwareSettings();
  }

  async fetchHardwareSettings() {
    this.isLoadingPool = true;
    this.loadError = false;

    try {
      const settings = await firstValueFrom(this.minerService.getMinerHardwareSettings(this.miner.ipAddress));
      
      if (settings) {
        // Formular mit den echten Werten vom Miner befüllen
        this.editForm.patchValue({
          poolUrl: settings.stratumURL || '',
          poolPort: settings.stratumPort || '',
          poolUser: settings.stratumUser || '',
          poolPassword: settings.stratumPassword || ''
        });
      } else {
        this.loadError = true;
      }
    } catch (e) {
      this.loadError = true;
    } finally {
      this.isLoadingPool = false;
    }
  }

  async onSubmit() {
    if (this.editForm.valid) {
      this.isSaving = true;
      const formValue = this.editForm.value;
      
      // 1. Lokale Metadaten im Browser updaten
      const finalModel = formValue.model === 'other' 
        ? (formValue.customModel || 'Custom') 
        : formValue.model;
      this.minerService.updateMiner(this.miner.id, formValue.name, formValue.ipAddress, finalModel);

      // 2. Hardware-Einstellungen an den ESP-Miner senden (nur wenn sie erfolgreich geladen wurden)
      if (!this.loadError && !this.isLoadingPool) {
        const hardwarePayload = {
          stratumURL: formValue.poolUrl,
          stratumPort: formValue.poolPort ? Number(formValue.poolPort) : 3333,
          stratumUser: formValue.poolUser,
          stratumPassword: formValue.poolPassword || 'x'
        };

        const result = await firstValueFrom(this.minerService.updateMinerHardwareSettings(formValue.ipAddress, hardwarePayload));
        
        if (result !== null) {
          alert('Pool-Einstellungen wurden erfolgreich auf dem Miner gespeichert!');
        }
      }

      this.isSaving = false;
      this.close.emit();
    }
  }
}