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

  // --- API Hilfsfunktion für CORS / Proxy ---
  private getApiUrl(ip: string, endpoint: string): string {
    // Da der Miner CORS erlaubt (Access-Control-Allow-Origin: *), 
    // können wir direkt anpingen, wenn wir lokal HTTP nutzen!
    const USE_LOCAL_PROXY = false;

    if (USE_LOCAL_PROXY) {
      return `/api-proxy/${ip}${endpoint}`;
    } else {
      // Wenn die IP schon ein http:// enthält, nicht doppelt anhängen
      const cleanIp = ip.replace(/^https?:\/\//, '');
      return `http://${cleanIp}${endpoint}`;
    }
  }

  private startPolling() {
    this.refreshAll();
    setInterval(() => this.refreshAll(), 10000); // Alle 10 Sekunden updaten
  }

  async refreshAll() {
    const currentMiners = this.miners();
    for (const miner of currentMiners) {
      try {
        // Neuer Endpunkt: /api/system/info
        const stats = await firstValueFrom(
          this.http.get<any>(this.getApiUrl(miner.ipAddress, '/api/system/info')).pipe(
            catchError(() => of(null))
          )
        );

        if (stats) {
          // Werte aus dem JSON der neuen Firmware auslesen
          this.miners.update(ms => ms.map(m => m.id === miner.id ? {
            ...m,
            status: 'online',
            // Hashrate kommt als z.B. 1429.59 (vermutlich GH/s), also / 1000 für TH/s
            hashrate: (stats.hashRate || 0) / 1000, 
            temp: stats.temp || 0,
            shares: stats.sharesAccepted || 0
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
    this.refreshAll();
  }

  deleteMiner(id: string) {
    this.miners.update(current => current.filter(m => m.id !== id));
  }

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
}