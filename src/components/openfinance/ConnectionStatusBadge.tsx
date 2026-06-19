import { CheckCircle2, Loader2, AlertTriangle, Clock, KeyRound } from 'lucide-react';

// [OF-UI-1 / F4] Badge de status da conexão bancária. Componente PURO (props → JSX).
// status: UPDATING | UPDATED | LOGIN_ERROR | OUTDATED | WAITING_USER_INPUT.
interface Props {
  status: string;
  errorCode?: string | null;
}

export default function ConnectionStatusBadge({ status, errorCode }: Props) {
  let label = status || 'Desconhecido';
  let cls = 'bg-muted text-muted-foreground';
  let Icon = Clock;
  let spin = false;

  switch (status) {
    case 'UPDATED':
      label = 'Atualizado'; cls = 'bg-success/15 text-success'; Icon = CheckCircle2; break;
    case 'UPDATING':
      label = 'Sincronizando'; cls = 'bg-primary/10 text-primary'; Icon = Loader2; spin = true; break;
    case 'LOGIN_ERROR':
      label = errorCode === 'CONSENT_EXPIRED' ? 'Consentimento expirado' : 'Erro de login';
      cls = 'bg-destructive/10 text-destructive'; Icon = KeyRound; break;
    case 'OUTDATED':
      label = 'Desatualizado'; cls = 'bg-warning/10 text-warning'; Icon = AlertTriangle; break;
    case 'WAITING_USER_INPUT':
      label = 'Ação necessária'; cls = 'bg-warning/10 text-warning'; Icon = AlertTriangle; break;
    default:
      break;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap ${cls}`}>
      <Icon className={`w-3.5 h-3.5 ${spin ? 'animate-spin' : ''}`} />
      {label}
    </span>
  );
}
