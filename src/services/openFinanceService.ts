import { api } from './api';

// [OF-UI-1 / F1] Serviço de Open Finance — espelha os contratos do backend já
// deployado (/api/v1/open-finance/*, FASE Open Finance / GATE-1). SOMENTE consumo:
// não altera backend. Bearer é injetado pelo interceptor do `api`; o retry global
// (FASE 4.6A-bis) repete só GET/HEAD/OPTIONS — POST/DELETE aqui NÃO são repetidos
// (não-idempotentes). `complete`/`sync` têm timeout maior (1ª sync é síncrona no back).

// Timeout (ms) p/ as chamadas lentas (connect/complete e sync). Configurável.
const OF_TIMEOUT_MS = Number(import.meta.env.VITE_OF_TIMEOUT_MS) || 30000;

// UPDATING | UPDATED | LOGIN_ERROR | OUTDATED | WAITING_USER_INPUT (string aberta p/ tolerar novos)
export type ConnectionStatus =
  | 'UPDATING' | 'UPDATED' | 'LOGIN_ERROR' | 'OUTDATED' | 'WAITING_USER_INPUT' | string;

export interface OFAccount {
  id: string;
  type: string;            // BANK | CREDIT
  subtype: string | null;  // CHECKING | SAVINGS | CREDIT_CARD
  name: string;
  number: string | null;   // últimos 4 dígitos
  balance: number;
  balanceDate: string | null;
  currencyCode: string;    // BRL
}

export interface OFConnection {
  id: string;
  institutionId: string;
  institutionName: string;
  institutionLogo: string | null;
  status: ConnectionStatus;
  errorCode: string | null;
  errorMessage: string | null;
  consentExpiresAt: string | null;
  lastSyncAt: string | null;
  lastSyncTxCount: number;
  createdAt: string;
  accounts: OFAccount[];
}

export interface SyncResult {
  synced: number;
  status: ConnectionStatus;
}

// POST /open-finance/connect/init → { connectToken } (token p/ o widget Pluggy)
export const initConnect = async (): Promise<{ connectToken: string }> => {
  const res = await api.post('/open-finance/connect/init');
  return res.data;
};

// POST /open-finance/connect/complete { itemId } → { connection } (registra + 1ª sync)
export const completeConnect = async (itemId: string): Promise<{ connection: OFConnection }> => {
  const res = await api.post('/open-finance/connect/complete', { itemId }, { timeout: OF_TIMEOUT_MS });
  return res.data;
};

// GET /open-finance/connections → { connections: OFConnection[] } (inclui contas + saldos)
export const listConnections = async (): Promise<OFConnection[]> => {
  const res = await api.get('/open-finance/connections');
  return Array.isArray(res.data?.connections) ? res.data.connections : [];
};

// POST /open-finance/connections/:id/sync → { synced, status }
export const syncConnection = async (id: string): Promise<SyncResult> => {
  const res = await api.post(`/open-finance/connections/${id}/sync`, undefined, { timeout: OF_TIMEOUT_MS });
  return res.data;
};

// DELETE /open-finance/connections/:id → { ok: true } (revoga no Pluggy + apaga local)
export const disconnectBank = async (id: string): Promise<{ ok: boolean }> => {
  const res = await api.delete(`/open-finance/connections/${id}`);
  return res.data;
};
