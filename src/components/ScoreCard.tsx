import { motion } from 'framer-motion';
import { Gauge, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { FinancialScore, ScoreBand } from '../services/scoreService';

interface ScoreCardProps {
    data: FinancialScore | null;
    loading: boolean;
}

// Cor por faixa (5 níveis aprovados).
const BAND_STYLE: Record<ScoreBand, { text: string; bar: string; ring: string }> = {
    'Crítico':   { text: 'text-destructive', bar: 'bg-destructive', ring: 'text-destructive' },
    'Atenção':   { text: 'text-orange-500',  bar: 'bg-orange-500',  ring: 'text-orange-500' },
    'Bom':       { text: 'text-primary',     bar: 'bg-primary',     ring: 'text-primary' },
    'Excelente': { text: 'text-success',     bar: 'bg-success',     ring: 'text-success' },
    'Elite':     { text: 'text-violet-500',  bar: 'bg-violet-500',  ring: 'text-violet-500' },
};

// Mini-medidor de um critério do breakdown (valor 0–100 ou null = n/a).
const Metric = ({ label, value, barClass }: { label: string; value: number | null; barClass: string }) => (
    <div className="rounded-xl bg-background/40 border border-border/40 p-3">
        <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
            <span className="text-xs font-bold tabular-nums">{value === null ? 'n/a' : value}</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted/60 overflow-hidden">
            <div className={`h-full rounded-full ${value === null ? 'bg-muted-foreground/30' : barClass} transition-all`} style={{ width: `${value === null ? 0 : Math.max(0, Math.min(100, value))}%` }} />
        </div>
    </div>
);

export const ScoreCard = ({ data, loading }: ScoreCardProps) => {
    if (loading) {
        return (
            <div className="p-6 rounded-2xl glass-card animate-pulse h-[180px] flex items-center justify-center">
                <Gauge className="h-6 w-6 text-muted-foreground animate-spin" />
            </div>
        );
    }
    if (!data) return null;

    const style = BAND_STYLE[data.band];
    const pct = Math.max(0, Math.min(100, data.score));

    const DeltaIcon = data.delta === null ? Minus : data.delta > 0 ? TrendingUp : data.delta < 0 ? TrendingDown : Minus;
    const deltaColor = data.delta === null || data.delta === 0
        ? 'text-muted-foreground'
        : data.delta > 0 ? 'text-success' : 'text-destructive';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-6 rounded-2xl glass-card relative overflow-hidden"
        >
            <div className={`absolute top-0 left-0 w-1 h-full ${style.bar}`} />

            {/* Score principal */}
            <div className="flex items-center gap-2 mb-3">
                <Gauge className={`h-4 w-4 ${style.ring}`} />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Score Financeiro</span>
            </div>

            <div className="flex items-end gap-3">
                <h2 className="text-4xl font-black tracking-tighter tabular-nums">{data.score}</h2>
                <span className="text-sm text-muted-foreground mb-1">/ 100</span>
                <span className={`mb-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${style.text} bg-muted/50`}>{data.band}</span>
            </div>

            <div className="mt-3 h-2 w-full rounded-full bg-muted/60 overflow-hidden">
                <div className={`h-full rounded-full ${style.bar} transition-all`} style={{ width: `${pct}%` }} />
            </div>

            {/* Evolução vs mês anterior */}
            <div className="mt-3 flex items-center gap-2 text-xs">
                <span className={`flex items-center gap-1 font-bold ${deltaColor}`}>
                    <DeltaIcon className="h-3.5 w-3.5" />
                    {data.delta === null ? '—' : `${data.delta > 0 ? '+' : ''}${data.delta}`}
                </span>
                <span className="text-muted-foreground">
                    {data.previousScore === null ? 'sem histórico do mês anterior' : `anterior: ${data.previousScore}`}
                </span>
            </div>

            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{data.message}</p>

            {/* Breakdown visual (valores vindos da API; sem recálculo no front) */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Metric label="Economia"     value={data.breakdown.economia}     barClass="bg-success" />
                <Metric label="Controle"     value={data.breakdown.controle}     barClass="bg-primary" />
                <Metric label="Metas"        value={data.breakdown.metas}        barClass="bg-violet-500" />
                <Metric label="Consistência" value={data.breakdown.consistencia} barClass="bg-orange-500" />
            </div>
        </motion.div>
    );
};
