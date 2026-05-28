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
  bestDiff?: string;
  uptimeSeconds?: number;
  fanSpeed?: number;
  power?: number;
  pool?: string;
}

export interface ShareLog {
  id: string;
  timestamp: Date;
  minerId: string;
  minerName: string;
  sharesAdded: number;
  totalShares: number;
}