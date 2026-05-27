export interface Miner {
  id: string;
  name: string;
  ipAddress: string;
  model: string;
  status: 'online' | 'offline' | 'warning';
  hashrate: number;
  temp: number;
  shares: number;
  addedAt: string;
  // Neue Felder aus der API
  bestDiff?: string;
  uptimeSeconds?: number;
  fanSpeed?: number;
  power?: number;
  pool?: string;
}