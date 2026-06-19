import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  initConnect,
  listConnections,
  syncConnection,
  disconnectBank,
  completeConnect,
  type OFConnection,
} from '../services/openFinanceService';

// [OF-UI-1 / F2] Estado e ações do Open Finance para a tela /contas.
// Consome EXCLUSIVAMENTE openFinanceService (F1) — sem axios/fetch direto aqui.
// Toda a lógica de toast (sonner) fica encapsulada neste hook; componentes
// futuros apenas consomem estado + chamam ações.

export interface UseOpenFinance {
  connections: OFConnection[];
  loading: boolean;
  error: string | null;
  syncingId: string | null;
  disconnectingId: string | null;
  refetch: () => Promise<void>;
  sync: (connectionId: string) => Promise<void>;
  disconnect: (connectionId: string) => Promise<void>;
  connectComplete: (itemId: string) => Promise<void>;
  startConnect: () => Promise<string | null>;
  connectError: (message?: string) => void;
}

// Lê a forma do erro (status/code) sem importar axios — apenas inspeção do objeto.
const statusOf = (e: unknown): number | undefined =>
  (e as { response?: { status?: number } })?.response?.status;
const isTimeout = (e: unknown): boolean =>
  (e as { code?: string })?.code === 'ECONNABORTED';

export function useOpenFinance(): UseOpenFinance {
  const [connections, setConnections] = useState<OFConnection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setConnections(await listConnections());
    } catch {
      setError('Não foi possível carregar suas conexões bancárias.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const sync = useCallback(async (connectionId: string) => {
    if (syncingId) return; // evita sync concorrente
    try {
      setSyncingId(connectionId);
      const r = await syncConnection(connectionId);
      const n = typeof r?.synced === 'number' ? r.synced : 0;
      toast.success(n > 0 ? `${n} transação(ões) sincronizada(s).` : 'Conexão sincronizada.');
      await refetch();
    } catch (e) {
      if (statusOf(e) === 429) toast.error('Sincronização recente. Aguarde alguns minutos.');
      else if (isTimeout(e)) toast.error('A sincronização demorou mais que o esperado. Tente novamente.');
      else toast.error('Não foi possível sincronizar. Tente novamente.');
    } finally {
      setSyncingId(null);
    }
  }, [syncingId, refetch]);

  const disconnect = useCallback(async (connectionId: string) => {
    if (disconnectingId) return;
    try {
      setDisconnectingId(connectionId);
      await disconnectBank(connectionId);
      toast.success('Banco desconectado.');
      await refetch();
    } catch (e) {
      if (statusOf(e) === 404) {
        toast.info('Conexão já removida.');
        await refetch();
      } else {
        toast.error('Não foi possível desconectar. Tente novamente.');
      }
    } finally {
      setDisconnectingId(null);
    }
  }, [disconnectingId, refetch]);

  const connectComplete = useCallback(async (itemId: string) => {
    try {
      setLoading(true);
      await completeConnect(itemId);
      toast.success('Banco conectado com sucesso.');
    } catch (e) {
      toast.error(isTimeout(e)
        ? 'A conexão demorou mais que o esperado. Verifique em instantes.'
        : 'Não foi possível concluir a conexão.');
    } finally {
      await refetch(); // reflete a conexão (mesmo parcial) e encerra o loading
    }
  }, [refetch]);

  // [F6] Inicia o fluxo de conexão: busca um connectToken novo (expira em 30 min)
  // para o widget Pluggy. Toast só aqui (regra: API/toast no hook).
  const startConnect = useCallback(async (): Promise<string | null> => {
    try {
      const { connectToken } = await initConnect();
      return connectToken ?? null;
    } catch (e) {
      toast.error(isTimeout(e)
        ? 'Tempo excedido ao iniciar a conexão. Tente novamente.'
        : 'Não foi possível iniciar a conexão bancária.');
      return null;
    }
  }, []);

  // [F6] Erro do widget (ciclo de vida do Pluggy Connect) → feedback ao usuário.
  const connectError = useCallback((message?: string) => {
    toast.error(message || 'Não foi possível conectar o banco. Tente novamente.');
  }, []);

  return {
    connections,
    loading,
    error,
    syncingId,
    disconnectingId,
    refetch,
    sync,
    disconnect,
    connectComplete,
    startConnect,
    connectError,
  };
}
