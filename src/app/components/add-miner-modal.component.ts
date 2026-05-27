import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MinerService } from '../services/miner.service';

@Component({
  selector: 'app-add-miner-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-backdrop" (click)="close.emit()">
      <div class="modal-card" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2 class="modal-title">Neuen Miner hinzufügen</h2>
          <button class="close-btn" (click)="close.emit()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <form [formGroup]="minerForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="name">Name des Miners</label>
            <input type="text" id="name" formControlName="name" placeholder="z.B. Lucky-01" class="form-input">
          </div>

          <div class="form-group">
            <label for="ipAddress">IP-Adresse</label>
            <input type="text" id="ipAddress" formControlName="ipAddress" placeholder="z.B. 192.168.178.50" class="form-input">
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

          @if (minerForm.get('model')?.value === 'other') {
            <div class="form-group" style="animation: fadeIn 0.2s ease-out;">
              <label for="customModel">Eigener Modellname</label>
              <input type="text" id="customModel" formControlName="customModel" placeholder="z.B. NerdMiner v2" class="form-input">
            </div>
          }

          <div class="modal-footer">
            <button type="button" class="btn-secondary" (click)="close.emit()">Abbrechen</button>
            <button type="submit" class="btn-primary" [disabled]="minerForm.invalid">Miner speichern</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(17, 24, 39, 0.4);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.2s ease-out;
    }

    .modal-card {
      background-color: var(--bg-surface);
      width: 100%;
      max-width: 480px;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      padding: 2rem;
      animation: slideUp 0.3s ease-out;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .modal-title {
      font-size: 1.25rem;
      font-weight: 700;
    }

    .close-btn {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 4px;
      border-radius: var(--radius-sm);
      transition: all 0.2s;
    }

    .close-btn:hover {
      background-color: var(--bg-main);
      color: var(--text-main);
    }

    .form-group {
      margin-bottom: 1.25rem;
    }

    label {
      display: block;
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: var(--text-main);
    }

    .form-input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid #E5E7EB;
      border-radius: var(--radius-md);
      font-family: inherit;
      font-size: 0.95rem;
      background-color: var(--bg-main);
      transition: all 0.2s;
      outline: none;
    }

    .form-input:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px var(--primary-light);
      background-color: var(--bg-surface);
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
    }

    .btn-secondary {
      padding: 0.75rem 1.25rem;
      border: none;
      background-color: var(--bg-main);
      color: var(--text-main);
      border-radius: var(--radius-full);
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .btn-secondary:hover {
      background-color: #E5E7EB;
    }

    .btn-primary {
      padding: 0.75rem 1.5rem;
      border: none;
      background-color: var(--primary);
      color: white;
      border-radius: var(--radius-full);
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: var(--primary-hover);
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
    }

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class AddMinerModalComponent {
  @Output() close = new EventEmitter<void>();
  minerForm: FormGroup;

  constructor(private fb: FormBuilder, private minerService: MinerService) {
    this.minerForm = this.fb.group({
      name: ['', Validators.required],
      ipAddress: ['', [Validators.required, Validators.pattern('^([0-9]{1,3}\\.){3}[0-9]{1,3}$')]],
      model: ['v06', Validators.required],
      customModel: [''] // Neues Feld für die eigene Eingabe
    });
  }

  onSubmit() {
    if (this.minerForm.valid) {
      const formValue = this.minerForm.value;
      
      // Wenn "other" ausgewählt ist, nehmen wir den Wert aus dem customModel-Feld, sonst den Standardwert
      const finalModel = formValue.model === 'other' 
        ? (formValue.customModel || 'Custom') 
        : formValue.model;

      this.minerService.addMiner(formValue.name, formValue.ipAddress, finalModel);
      this.close.emit();
    }
  }
}