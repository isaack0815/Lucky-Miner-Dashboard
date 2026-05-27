import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  template: `
    <header class="header">
      <div class="header-search">
        <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input type="text" placeholder="Miner suchen..." class="search-input" />
      </div>

      <div class="header-actions">
        <button class="action-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
          <span class="badge"></span>
        </button>
        <div class="profile-menu">
          <div class="avatar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
          <span class="profile-name">Admin</span>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 2rem;
      background-color: transparent;
    }

    .header-search {
      position: relative;
      width: 300px;
    }

    .search-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
    }

    .search-input {
      width: 100%;
      padding: 0.875rem 1rem 0.875rem 3rem;
      border-radius: var(--radius-full);
      border: 1px solid transparent;
      background-color: var(--bg-surface);
      box-shadow: var(--shadow-sm);
      font-family: inherit;
      font-size: 0.875rem;
      outline: none;
      transition: all 0.2s;
    }

    .search-input:focus {
      border-color: var(--primary-light);
      box-shadow: 0 0 0 3px var(--primary-light);
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .action-btn {
      position: relative;
      background: var(--bg-surface);
      border: none;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--text-muted);
      box-shadow: var(--shadow-sm);
      transition: color 0.2s;
    }

    .action-btn:hover {
      color: var(--primary);
    }

    .badge {
      position: absolute;
      top: 10px;
      right: 12px;
      width: 8px;
      height: 8px;
      background-color: var(--danger);
      border-radius: 50%;
      border: 2px solid var(--bg-surface);
    }

    .profile-menu {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      background-color: var(--bg-surface);
      padding: 0.5rem 1rem 0.5rem 0.5rem;
      border-radius: var(--radius-full);
      box-shadow: var(--shadow-sm);
    }

    .avatar {
      width: 36px;
      height: 36px;
      background-color: var(--primary-light);
      color: var(--primary);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .profile-name {
      font-weight: 600;
      font-size: 0.875rem;
      color: var(--text-main);
    }
  `]
})
export class HeaderComponent {}