import { Injectable, signal, effect, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { of, firstValueFrom } from 'rxjs';
import { Miner, ShareLog, MinerApiResponse } from '../models/miner.model';
import { ToastService } from './toast.service';

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
  private toastService = inject(ToastService);
  
  private pollingIntervalId: ReturnType<typeof setInterval> | null = null;
  private isRefreshing = false; // Sperre, um überlappende Abfragen zu verhindern

  miners = signal<Miner[]>(this.loadFromStorage());
  settings = signal<AppSettings>(this.loadSettings());
  searchTerm = signal<string>('');
  
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
    effect(() => {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.miners()));
    });
    
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
      return stored ? JSON.parse(stored) : { refreshInterval: 10000 };
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
    this.refreshAll();
    this.pollingIntervalId = setInterval(() => this.refreshAll(), intervalMs);
  }

  async refreshAll() {
    // Wenn bereits eine Abfrage läuft, breche ab um Überlappungen zu vermeiden
    if (this.isRefreshing) return;
    this.isRefreshing = true;

    try {
      const currentMiners = this.miners();
      
      // Parallel abfragen, damit es schneller geht
      await Promise.all(currentMiners.map(async (miner) => {
        try {
          const stats = await firstValueFrom(
            this.http.get<MinerApiResponse>(this.getApiUrl(miner.ipAddress, '/api/system/info')).pipe(
              catchError(() => of(null))
            )
          );

          if (stats) {
            const newShares = stats.sharesAccepted || 0;
            let diffToLog = 0;

            // Atomares Update: Wir holen uns den absolut neusten Zustand aus dem Signal
            this.miners.update(ms => ms.map(m => {
              if (m.id === miner.id) {
                // Nur loggen, wenn der Miner schon vorher online war und Shares > 0 hatte
                if (m.status === 'online' && m.shares > 0 && newShares > m.shares) {
                  diffToLog = newShares - m.shares;
                }

                return {
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
                };
              }
              return m;
            }));

            // Log erstellen & Toast anzeigen, falls es wirklich ein Zuwachs war
            if (diffToLog > 0) {
              this.addShareLog(miner.id, miner.name, diffToLog, newShares);
              this.toastService.success(`⛏️ ${miner.name} hat ${diffToLog} neue(n) Share(s) gefunden!`);
            }
          } else {
            this.miners.update(ms => ms.map(m => m.id === miner.id ? {...m, status: 'offline'} : m));
          }
        } catch (e) {
          this.miners.update(ms => ms.map(m => m.id === miner.id ? {...m, status: 'offline'} : m));
        }
      }));
    } finally {
      this.isRefreshing = false;
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
    this.toastService.info(`Miner "${name}" hinzugefügt.`);
    this.refreshAll();
  }

  updateMiner(id: string, name: string, ipAddress: string, model: string) {
    this.miners.update(current => current.map(m => 
      m.id === id ? { ...m, name, ipAddress, model } : m
    ));
    this.toastService.success(`Miner "${name}" gespeichert.`);
    this.refreshAll(); 
  }

  deleteMiner(id: string) {
    this.miners.update(current => current.filter(m => m.id !== id));
    this.toastService.info('Miner wurde entfernt.');
  }

  restartMiner(id: string) {
    const miner = this.miners().find(m => m.id === id);
    if (miner) {
      fetch(this.getApiUrl(miner.ipAddress, '/api/system/restart'), { method: 'POST', mode: 'no-cors' }).catch(e => console.error(e));
      this.toastService.warning(`Neustart an ${miner.name} gesendet.`);
    }
  }

  identifyMiner(id: string) {
    const miner = this.miners().find(m => m.id === id);
    if (miner) {
      fetch(this.getApiUrl(miner.ipAddress, '/api/system/identify'), { method: 'POST', mode: 'no-cors' }).catch(e => console.error(e));
      this.toastService.info(`Display von ${miner.name} blinkt.`);
    }
  }

  /* --- EINSTELLUNGEN & DATEN --- */

  updateRefreshInterval(ms: number) {
    this.settings.update(s => ({ ...s, refreshInterval: ms }));
    this.toastService.success(`Abfrage-Intervall auf ${ms / 1000} Sekunden gesetzt.`);
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
    this.toastService.info('Backup wird heruntergeladen...');
  }

  importData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data)) {
        this.miners.set(data);
        this.refreshAll();
        this.toastService.success('Daten erfolgreich importiert!');
        return true;
      }
      return false;
    } catch(e) {
      this.toastService.error('Fehler beim Importieren der Daten.');
      return false;
    }
  }

  resetAllData() {
    this.miners.set([]);
    this.shareLogs.set([]);
    this.toastService.warning('Alle Daten wurden gelöscht.');
  }
}