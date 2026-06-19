import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { PluggyConnect } from 'react-pluggy-connect';

// [OF-UI-1 / F6] Botão "Conectar banco" + widget Pluggy Connect. Componente de
// APRESENTAÇÃO: recebe os callbacks por props (a lógica de API/toast vive no
// useOpenFinance, via Contas). Sem axios/fetch e sem lógica de negócio aqui.
//
// Fluxo: clique → onStartConnect() (initConnect → connectToken, novo a cada abertura;
// expira em 30 min) → abre <PluggyConnect> → onSuccess({ item }) → onConnected(item.id)
// (connectComplete → refetch). Contratos confirmados na auditoria oficial Pluggy.
interface Props {
  onStartConnect: () => Promise<string | null>;
  onConnected: (itemId: string) => void | Promise<void>;
  onConnectError: (message?: string) => void;
}

export default function ConnectBankButton({ onStartConnect, onConnected, onConnectError }: Props) {
  const [token, setToken] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  const open = async () => {
    if (starting) return;
    setStarting(true);
    const t = await onStartConnect(); // token novo a cada abertura (validade 30 min)
    setStarting(false);
    if (t) setToken(t);
  };

  return (
    <>
      <button
        onClick={open}
        disabled={starting}
        className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
      >
        {starting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        Conectar banco
      </button>

      {token && (
        <PluggyConnect
          connectToken={token}
          includeSandbox={import.meta.env.VITE_PLUGGY_INCLUDE_SANDBOX === 'true'}
          onSuccess={(data: { item: { id: string } }) => {
            setToken(null);
            void onConnected(data.item.id);
          }}
          onError={(error: { message?: string }) => {
            setToken(null);
            onConnectError(error?.message);
          }}
          onClose={() => setToken(null)}
        />
      )}
    </>
  );
}
