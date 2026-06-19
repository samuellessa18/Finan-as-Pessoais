import { Landmark, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useOpenFinance } from '../hooks/useOpenFinance';
import ConnectionCard from '../components/openfinance/ConnectionCard';
import ConnectBankButton from '../components/openfinance/ConnectBankButton';

// [OF-UI-1 / F3] Shell da página /contas. Prova a navegação e o consumo do hook
// useOpenFinance (F2). Exibe SOMENTE loading / erro / vazio. A listagem detalhada
// (ConnectionCard, AccountRow, sync, desconectar, widget) chega nas fases F4–F6.
export default function Contas() {
  const {
    connections, loading, error, refetch, sync, disconnect, syncingId, disconnectingId,
    startConnect, connectComplete, connectError,
  } = useOpenFinance();

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <Landmark className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Contas Conectadas</h1>
            <p className="text-muted-foreground text-sm">
              Conecte seus bancos via Open Finance para acompanhar saldos.
            </p>
          </div>
        </div>
        <ConnectBankButton
          onStartConnect={startConnect}
          onConnected={connectComplete}
          onConnectError={connectError}
        />
      </div>

      {loading ? (
        <div className="glass-card p-12 rounded-2xl flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="glass-card p-8 rounded-2xl border-l-4 border-l-warning bg-warning/5">
          <div className="flex items-center gap-2 text-foreground">
            <AlertCircle className="w-5 h-5 text-warning" />
            <p className="text-sm font-medium">{error}</p>
          </div>
          <button
            onClick={refetch}
            className="mt-4 flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-xl text-sm font-bold transition-all"
          >
            <RefreshCw className="w-4 h-4" /> Tentar novamente
          </button>
        </div>
      ) : connections.length === 0 ? (
        <div className="glass-card p-12 rounded-2xl text-center border-dashed border-2">
          <Landmark className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-60" />
          <p className="font-medium">Nenhum banco conectado ainda.</p>
          <p className="text-muted-foreground text-sm mt-1">
            Use o botão "Conectar banco" acima para começar com segurança.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {connections.map((c) => (
            <ConnectionCard
              key={c.id}
              connection={c}
              onSync={sync}
              onDisconnect={disconnect}
              syncing={syncingId === c.id}
              disconnecting={disconnectingId === c.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
