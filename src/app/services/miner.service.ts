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

  miners = signal<Miner[]>(this.loadFromStorage());
  searchTerm = signal<string>('');
  
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

  private getApiUrl(ip: string, endpoint: string): string {
    const cleanIp = ip.replace(/^https?:\/\//, '');
    
    // Nutze den lokalen Proxy, wenn das Dashboard über localhost aufgerufen wird.
    // Das umgeht die CORS-Preflight (OPTIONS) Blockade des Browsers bei PATCH-Requests!
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return `/api-proxy/${cleanIp}${endpoint}`;
    }
    
    // Auf einem Live-Server direkt ansprechen
    return `http://${cleanIp}${endpoint}`;
  }

  private startPolling() {
    this.refreshAll();
    setInterval(() => this.refreshAll(), 10000);
  }

  async refreshAll() {
    const currentMiners = this.miners();
    for (const miner of currentMiners) {
      try {
        const stats = await firstValueFrom(
          this.http.get<any>(this.getApiUrl(miner.ipAddress, '/api/system/info')).pipe(
            catchError(() => of(null))
          )
        );

        if (stats) {
          this.miners.update(ms => ms.map(m => m.id === miner.id ? {
            ...m,
            status: 'online',
            hashrate: (stats.hashRate || 0) / 1000, 
            temp: stats.temp || 0,
            shares: stats.sharesAccepted || 0,
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

  // --- Lokale Verwaltung ---

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

  // --- API Steuerung der echten Hardware ---

  restartMiner(id: string) {
    const miner = this.miners().find(m => m.id === id);
    if (miner) {
      this.http.post(this.getApiUrl(miner.ipAddress, '/api/system/restart'), {}).subscribe({
        error: () => console.error(`Fehler beim Neustart von ${miner.name}`)
      });
    }
  }

  identifyMiner(id: string) {
    const miner = this.miners().find(m => m.id === id);
    if (miner) {
      this.http.post(this.getApiUrl(miner.ipAddress, '/api/system/identify'), {}).subscribe({
        error: () => console.error(`Fehler beim Identifizieren von ${miner.name}`)
      });
    }
  }

  getMinerHardwareSettings(ip: string) {
    return this.http.get<any>(this.getApiUrl(ip, '/api/system/info')).pipe(
      catchError(() => of(null))
    );
  }

  // Sendet sauberes JSON per PATCH. Lokal über den Proxy, live direkt.
  updateMinerHardwareSettings(ip: string, settings: any) {
    return this.http.patch(this.getApiUrl(ip, '/api/system/info'), settings).pipe(
      catchError((err) => {
        console.error('Fehler beim Speichern der Hardware-Einstellungen per PATCH', err);
        return of(null);
      })
    );
  }
}