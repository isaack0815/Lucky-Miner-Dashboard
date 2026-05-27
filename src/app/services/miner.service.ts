import { Injectable, signal, effect, computed } from '@angular/core';
import { Miner } from '../models/miner.model';

@Injectable({
  providedIn: 'root'
})
export class MinerService {
  private readonly STORAGE_KEY = 'luckyminers_data';

  // Signal für die Miner-Liste (reaktiv)
  miners = signal<Miner[]>(this.loadFromStorage());

  // Abgeleitetes Signal für Statistiken
  totalMiners = computed(() => this.miners().length);
  onlineMiners = computed(() => this.miners().filter(m => m.status === 'online').length);

  constructor() {
    // Dieser Effect speichert die Miner automatisch im LocalStorage, wenn sich das Signal ändert
    effect(() => {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.miners()));
    });
  }

  private loadFromStorage(): Miner[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Fehler beim Laden der Miner', e);
      return [];
    }
  }

  addMiner(name: string, ipAddress: string, model: string) {
    const newMiner: Miner = {
      id: crypto.randomUUID(),
      name,
      ipAddress,
      model,
      status: 'offline', // Standardmäßig offline, bis echte Daten abgerufen werden
      hashrate: 0,
      temp: 0,
      shares: 0,
      addedAt: new Date().toISOString()
    };

    this.miners.update(current => [...current, newMiner]);
  }

  deleteMiner(id: string) {
    this.miners.update(current => current.filter(m => m.id !== id));
  }
}