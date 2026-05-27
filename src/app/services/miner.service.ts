import { Injectable, signal, effect, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { of, firstValueFrom } from 'rxjs';
import { Miner } from '../models/miner.model';

@Injectable({
  providedIn: 'root'
})
export class MinerService {
  private readonly STORAGE_KEY = 'luckyminers_data';
  private http = inject(HttpClient);

  // Signal für die Miner-Liste
  miners = signal<Miner[]>(this.loadFromStorage());

  // Abgeleitete Signale für das Dashboard
  totalMiners = computed(() => this.miners().length);
  onlineMiners = computed(() => this.miners().filter(m => m.status === 'online').length);
  
  totalHashrate = computed(() => 
    this.miners().reduce((acc, m) => acc + (m.status === 'online' ? m.hashrate : 0), 0)
  );
  
  avgTemp = computed(() => {
    const online = this.miners().filter(m => m.status === 'online' && m.temp > 0);
    if (online.length === 0) return 0;
    return Math.round(online.reduce((acc, m) => acc + m.temp, 0) / online.length);
  });
  
  totalShares = computed(() => 
    this.miners().reduce((acc, m) => acc + (m.status === 'online' ? m.shares : 0), 0)
  );

  constructor() {
    // LocalStorage Synchronisation
    effect(() => {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.miners()));
    });

    // Automatisches Abfragen der Miner-Daten starten
    this.startPolling();
  }

  private loadFromStorage(): Miner[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  private startPolling() {
    this.refreshAll();
    // Alle 10 Sekunden neue Daten abrufen
    setInterval(() => this.refreshAll(), 10000);
  }

  async refreshAll() {
    const currentMiners = this.miners();
    for (const miner of currentMiners) {
      try {
        const stats = await firstValueFrom(
          this.http.get<any>(`http://${miner.ipAddress}/api/system/statistics`).pipe(
            catchError(() => of(null)) // Bei Netzwerkfehler (Offline) null zurückgeben
          )
        );

        if (stats) {
          this.miners.update(ms => ms.map(m => m.id === miner.id ? {
            ...m,
            status: 'online',
            // Annahme: ESP-Miner gibt Hashrate oft in GH/s aus. Wir rechnen in TH/s um (/1000)
            hashrate: (stats.hashrate || 0) / 1000, 
            temp: stats.asicTemp || 0,
            shares: stats.shares || stats.bestShare || 0
          } : m));
        } else {
          this.miners.update(ms => ms.map(m => m.id === miner.id ? {...m, status: 'offline'} : m));
        }
      } catch (e) {
        this.miners.update(ms => ms.map(m => m.id === miner.id ? {...m, status: 'offline'} : m));
      }
    }
  }

  addMiner(name: string, ipAddress: string, model: string) {
    const newMiner: Miner = {
      id: crypto.randomUUID(),
      name,
      ipAddress,
      model,
      status: 'offline',
      hashrate: 0,
      temp: 0,
      shares: 0,
      addedAt: new Date().toISOString()
    };
    this.miners.update(current => [...current, newMiner]);
    // Sofort nach dem Hinzufügen Daten abrufen
    this.refreshAll();
  }

  deleteMiner(id: string) {
    this.miners.update(current => current.filter(m => m.id !== id));
  }

  // --- Aktive Steuerung der API ---

  restartMiner(id: string) {
    const miner = this.miners().find(m => m.id === id);
    if (miner) {
      this.http.post(`http://${miner.ipAddress}/api/system/restart`, {}).subscribe({
        error: () => console.error(`Fehler beim Neustart von ${miner.name}`)
      });
    }
  }

  identifyMiner(id: string) {
    const miner = this.miners().find(m => m.id === id);
    if (miner) {
      this.http.post(`http://${miner.ipAddress}/api/system/identify`, {}).subscribe({
        error: () => console.error(`Fehler beim Identifizieren von ${miner.name}`)
      });
    }
  }
}