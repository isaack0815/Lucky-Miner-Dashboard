import { Injectable, signal, effect, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { of, firstValueFrom } from 'rxjs';
import { Miner, ShareLog, MinerApiResponse } from '../models/miner.model';

export interface AppSettings {
  refreshInterval: number; // in Millisekunden
}

@Injectable({
  providedIn: 'root'
})
export class MinerService {
  private readonly STORAGE_KEY = 'luckyminers_data';
  private readonly SETTINGS_KEY = 'luckyminers_settings';
  private http = inject(HttpClient);
  
  // Der korrekte Typ statt any
  private pollingIntervalId: ReturnType<typeof setInterval> | null = null;

  miners = signal<Miner[]>(this.loadFromStorage());
  settings = signal<AppSettings>(this.loadSettings());
  searchTerm = signal<string>('');
  
  // Signal für die Share-Logs
  shareLogs = signal<ShareLog[]>([]);
  
  filteredMiners = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const allMiners = this.miners();
    if (!term) return allMiners;
    return allMiners.filter(m => 
      m.name.toLowerCase().includes(term) || 
      m.ipAddress.includes(term) ||
      m.model.toLowerCase().includes(term)
    );
  });

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

  totalPower = computed(() => 
    this.miners().reduce((acc, m) => acc + (m.status === 'online' ? (m.power || 0) : 0), 0)
  );

  constructor() {
    // Automatisches Speichern der Miner bei Änderungen
    effect(() => {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.miners()));
    });
    
    // Automatisches Anwenden und Speichern der Einstellungen (Polling)
    effect(() => {
      const currentSettings = this.settings();
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(currentSettings));
      this.updatePolling(currentSettings.refreshInterval);
    });
  }

  private loadFromStorage(): Miner[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  private loadSettings(): AppSettings {
    try {
      const stored = localStorage.getItem(this.SETTINGS_KEY);
      return stored ? JSON.parse(stored) : { refreshInterval: 10000 }; // Standard: 10 Sekunden
    } catch(e) {
      return { refreshInterval: 10000 };
    }
  }

  private getApiUrl(ip: string, endpoint: string): string {
    const cleanIp = ip.replace(/^https?:\/\//, '');
    return `http://${cleanIp}${endpoint}`;
  }

  private updatePolling(intervalMs: number) {
    if (this.pollingIntervalId) {
      clearInterval(this.pollingIntervalId);
    }
    this.refreshAll(); // Direkt einmal abfragen
    this.pollingIntervalId = setInterval(() => this.refreshAll(), intervalMs);
  }

  async refreshAll() {
    const currentMiners = this.miners();
    for (const miner of currentMiners) {
      try {
        const stats = await firstValueFrom(
          this.http.get<MinerApiResponse>(this.getApiUrl(miner.ipAddress, '/api/system/info')).pipe(
            catchError(() => of(null))
          )
        );

        if (stats) {
          const newShares = stats.sharesAccepted || 0;
          
          if (miner.status === 'online' && newShares > miner.shares) {
            const diff = newShares - miner.shares;
            this.addShareLog(miner.id, miner.name, diff, newShares);
          }

          this.miners.update(ms => ms.map(m => m.id === miner.id ? {
            ...m,
            status: 'online',
            hashrate: (stats.hashRate || 0) / 1000, 
            temp: stats.temp || 0,
            shares: newShares,
            bestDiff: stats.bestDiff,
            uptimeSeconds: stats.uptimeSeconds,
            fanSpeed: stats.fanSpeed,
            power: stats.power,
            pool: stats.stratumURL
          } : m));
        } else {
          this.miners.update(ms => ms.map(m => m.id === miner.id ? {...m, status: 'offline'} : m));
        }
      } catch (e) {
        this.miners.update(ms => ms.map(m => m.id === miner.id ? {...m, status: 'offline'} : m));
      }
    }
  }

  private addShareLog(minerId: string, minerName: string, sharesAdded: number, totalShares: number) {
    const newLog: ShareLog = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date(),
      minerId,
      minerName,
      sharesAdded,
      totalShares
    };
    this.shareLogs.update(logs => [newLog, ...logs].slice(0, 50));
  }

  /* --- VERWALTUNG --- */

  addMiner(name: string, ipAddress: string, model: string) {
    const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
    const newMiner: Miner = {
      id: generateId(),
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
    this.refreshAll();
  }

  updateMiner(id: string, name: string, ipAddress: string, model: string) {
    this.miners.update(current => current.map(m => 
      m.id === id ? { ...m, name, ipAddress, model } : m
    ));
    this.refreshAll(); 
  }

  deleteMiner(id: string) {
    this.miners.update(current => current.filter(m => m.id !== id));
  }

  restartMiner(id: string) {
    const miner = this.miners().find(m => m.id === id);
    if (miner) {
      fetch(this.getApiUrl(miner.ipAddress, '/api/system/restart'), { method: 'POST', mode: 'no-cors' }).catch(e => console.error(e));
    }
  }

  identifyMiner(id: string) {
    const miner = this.miners().find(m => m.id === id);
    if (miner) {
      fetch(this.getApiUrl(miner.ipAddress, '/api/system/identify'), { method: 'POST', mode: 'no-cors' }).catch(e => console.error(e));
    }
  }

  /* --- EINSTELLUNGEN & DATEN --- */

  updateRefreshInterval(ms: number) {
    this.settings.update(s => ({ ...s, refreshInterval: ms }));
  }

  exportData() {
    const dataStr = JSON.stringify(this.miners(), null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `luckyminer-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  importData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data)) {
        // Optionale Validierung ob die Struktur ungefähr passt könnte man hier machen
        this.miners.set(data);
        this.refreshAll();
        return true;
      }
      return false;
    } catch(e) {
      return false;
    }
  }

  resetAllData() {
    this.miners.set([]);
    this.shareLogs.set([]);
  }
}