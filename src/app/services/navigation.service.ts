import { Injectable, signal } from '@angular/core';

export type PageView = 'dashboard' | 'miners' | 'stats' | 'settings';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  currentView = signal<PageView>('dashboard');

  setView(view: PageView) {
    this.currentView.set(view);
  }
}