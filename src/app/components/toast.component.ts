import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-toasts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast-item" [ngClass]="toast.type">
          
          <div class="toast-icon">
            @if (toast.type === 'success') {
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            } @else if (toast.type === 'info') {
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            }
          </div>

          <span class="toast-msg">{{ toast.message }}</span>
          
          <button class="toast-close" (click)="toastService.remove(toast.id)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 1.5rem;
      right: 1.5rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      pointer-events: none;
    }

    .toast-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: var(--radius-md);
      background: var(--bg-surface);
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      pointer-events: auto;
      animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      min-width: 300px;
      border-left: 4px solid transparent;
      transform-origin: top right;
    }

    /* Colors by type */
    .toast-item.success { border-left-color: var(--success); }
    .toast-item.success .toast-icon { color: var(--success); }
    
    .toast-item.info { border-left-color: var(--primary); }
    .toast-item.info .toast-icon { color: var(--primary); }
    
    .toast-item.warning { border-left-color: var(--warning); }
    .toast-item.warning .toast-icon { color: var(--warning); }
    
    .toast-item.error { border-left-color: var(--danger); }
    .toast-item.error .toast-icon { color: var(--danger); }

    .toast-icon {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .toast-msg {
      flex-grow: 1;
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--text-main);
    }

    .toast-close {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--text-muted);
      opacity: 0.6;
      transition: all 0.2s;
      display: flex;
      padding: 4px;
      border-radius: 4px;
    }

    .toast-close:hover {
      opacity: 1;
      background: var(--bg-main);
      color: var(--text-main);
    }

    @keyframes slideInRight {
      from { transform: translateX(120%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);
}