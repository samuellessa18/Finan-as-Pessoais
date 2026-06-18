import { AlertTriangle, TrendingUp, Loader2 } from 'lucide-react';
import { usePatterns } from '../hooks/usePatterns';
import type { PatternSeverity } from '../services/patternService';

// Destaque por severidade. O backend (gate high-only) persiste hoje só alertas
// 'high'; o estilo 'medium' fica pronto p/ quando/se medium for persistido.
const SEV_STYLE: Record<PatternSeverity, { border: string; icon: string; chip: string; label: string }> = {
    high:   { border: 'border-l-destructive',      icon: 'text-destructive',      chip: 'bg-destructive/15 text-destructive',     label: 'Alta' },
    medium: { border: 'border-l-orange-500',       icon: 'text-orange-500',       chip: 'bg-orange-500/15 text-orange-500',       label: 'Média' },
    low:    { border: 'border-l-muted-foreground', icon: 'text-muted-foreground', chip: 'bg-muted text-muted-foreground',          label: 'Baixa' },
};

const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });

export function PatternAlertsSection() {
    const { patterns, loading } = usePatterns();

    return (
        <section className="mb-10">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Padrões Detectados
            </h3>

            {loading ? (
                <div className="glass-card rounded-2xl p-10 flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            ) : patterns.length === 0 ? (
                <div className="text-center p-10 glass-card rounded-2xl border-dashed">
                    <TrendingUp className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-muted-foreground font-medium">Nenhum padrão de gasto detectado nos últimos 90 dias.</p>
                    <p className="text-muted-foreground/70 text-sm mt-1">Quando uma categoria subir além do normal, o aviso aparece aqui.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {patterns.map((p, i) => {
                        const s = SEV_STYLE[p.severity] || SEV_STYLE.low;
                        return (
                            <div key={`${p.category}-${p.detectedAt}-${i}`} className={`glass-card rounded-2xl p-5 border-l-4 ${s.border}`}>
                                <div className="flex gap-4 items-start">
                                    <div className="mt-1"><AlertTriangle className={`w-5 h-5 ${s.icon}`} /></div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between gap-3 mb-1">
                                            <span className="font-bold">{p.category}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-destructive tabular-nums">+{p.percentage}%</span>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${s.chip}`}>{s.label}</span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-foreground leading-relaxed">{p.message}</p>
                                        <div className="text-xs uppercase tracking-wider font-bold mt-2 opacity-70">{fmtDate(p.detectedAt)}</div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
