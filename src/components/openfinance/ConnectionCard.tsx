import { Landmark, RefreshCw } from 'lucide-react';
import type { OFConnection } from '../../services/openFinanceService';
import ConnectionStatusBadge from './ConnectionStatusBadge';
import AccountRow from './AccountRow';
import DisconnectDialog from './DisconnectDialog';

// [OF-UI-1 / F4] Card de uma conexão bancária: instituição, status, último sync e
// contas/saldos. Componente PURO (sem hook/API/ações — sync/desconectar são F5).
function formatSync(iso: string | null): string {
  if (!iso) return 'Nunca sincronizado';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Sincronização desconhecida';
  return `Último sync: ${d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}`;
}

interface Props {
  connection: OFConnection;
  onSync: (id: string) => void;
  onDisconnect: (id: string) => void;
  syncing: boolean;
  disconnecting: boolean;
}

export default function ConnectionCard({ connection, onSync, onDisconnect, syncing, disconnecting }: Props) {
  const { id, institutionName, institutionLogo, status, errorCode, lastSyncAt, lastSyncTxCount, accounts } = connection;
  const accs = Array.isArray(accounts) ? accounts : [];

  return (
    <div className="glass-card p-6 rounded-2xl">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center overflow-hidden border border-border flex-shrink-0">
            {institutionLogo ? (
              <img src={institutionLogo} alt={institutionName} className="h-full w-full object-contain" />
            ) : (
              <Landmark className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold tracking-tight truncate">{institutionName}</h3>
            <p className="text-xs text-muted-foreground">
              {formatSync(lastSyncAt)}{lastSyncTxCount ? ` · ${lastSyncTxCount} transações` : ''}
            </p>
          </div>
        </div>
        <ConnectionStatusBadge status={status} errorCode={errorCode} />
      </div>

      {accs.length > 0 ? (
        <div className="divide-y divide-border/40 border-t border-border/40 pt-1">
          {accs.map((a) => (
            <AccountRow key={a.id} account={a} />
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground border-t border-border/40 pt-3">
          Nenhuma conta disponível nesta conexão ainda.
        </p>
      )}

      {/* [F5] Ações de gerenciamento — sync/desconectar via props (hook em Contas) */}
      <div className="flex justify-end gap-1 mt-4 pt-3 border-t border-border/40">
        <button
          onClick={() => onSync(id)}
          disabled={syncing || disconnecting}
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Sincronizando...' : 'Sincronizar'}
        </button>
        <DisconnectDialog
          institutionName={institutionName}
          disconnecting={disconnecting}
          onConfirm={() => onDisconnect(id)}
        />
      </div>
    </div>
  );
}
