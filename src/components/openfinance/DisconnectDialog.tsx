import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Trash2, Loader2 } from 'lucide-react';

// [OF-UI-1 / F5] Confirmação de desconexão (radix). PURO: recebe `onConfirm` por prop
// (a ação real e os toasts vivem no useOpenFinance, via Contas). Não chama API.
interface Props {
  institutionName: string;
  disconnecting: boolean;
  onConfirm: () => void;
}

export default function DisconnectDialog({ institutionName, disconnecting, onConfirm }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          disabled={disconnecting}
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Desconectar
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 glass-card p-6 rounded-2xl border border-border shadow-xl">
          <Dialog.Title className="text-lg font-bold tracking-tight">Desconectar banco</Dialog.Title>
          <Dialog.Description className="text-sm text-muted-foreground mt-2 leading-relaxed">
            Tem certeza que deseja desconectar <strong className="text-foreground">{institutionName}</strong>?
            As contas e saldos sincronizados serão removidos. Esta ação não pode ser desfeita.
          </Dialog.Description>

          <div className="flex justify-end gap-2 mt-6">
            <Dialog.Close asChild>
              <button
                disabled={disconnecting}
                className="text-sm font-bold px-4 py-2 rounded-xl text-muted-foreground hover:bg-muted/50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
            </Dialog.Close>
            <button
              onClick={onConfirm}
              disabled={disconnecting}
              className="flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-50"
            >
              {disconnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              {disconnecting ? 'Desconectando...' : 'Desconectar'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
