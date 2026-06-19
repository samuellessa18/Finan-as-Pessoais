import type { OFAccount } from '../../services/openFinanceService';

// [OF-UI-1 / F4] Linha de uma conta bancária (nome, tipo, saldo em BRL). Componente PURO.
const SUBTYPE_LABEL: Record<string, string> = {
  CHECKING: 'Conta Corrente',
  SAVINGS: 'Poupança',
  CREDIT_CARD: 'Cartão de Crédito',
};

function accountLabel(a: OFAccount): string {
  if (a.subtype && SUBTYPE_LABEL[a.subtype]) return SUBTYPE_LABEL[a.subtype];
  if (a.type === 'CREDIT') return 'Crédito';
  if (a.type === 'BANK') return 'Conta';
  return a.type || 'Conta';
}

function formatBRL(value: number, currency: string): string {
  try {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: currency || 'BRL' }).format(value);
  } catch {
    return `R$ ${Number(value).toFixed(2)}`;
  }
}

interface Props {
  account: OFAccount;
}

export default function AccountRow({ account }: Props) {
  const negative = account.balance < 0;
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{account.name}</p>
        <p className="text-xs text-muted-foreground">
          {accountLabel(account)}{account.number ? ` ····${account.number}` : ''}
        </p>
      </div>
      <span className={`text-sm font-bold tabular-nums whitespace-nowrap ${negative ? 'text-destructive' : 'text-foreground'}`}>
        {formatBRL(account.balance, account.currencyCode)}
      </span>
    </div>
  );
}
