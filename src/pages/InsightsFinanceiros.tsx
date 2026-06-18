import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, AlertTriangle, Wallet, Loader2 } from 'lucide-react';
import { ScoreCard } from '../components/ScoreCard';
import { SummaryCards } from '../components/SummaryCards';
import { useScore } from '../hooks/useScore';
import { useBudgets } from '../hooks/useBudgets';
import { usePatterns } from '../hooks/usePatterns';
import { getFinanceSummary } from '../services/financeService';
import type { PatternSeverity } from '../services/patternService';
import type { BudgetStatus } from '../services/budgetService';

const SEV_STYLE: Record<PatternSeverity, { chip: string; label: string }> = {
    high:   { chip: 'bg-destructive/15 text-destructive', label: 'Alta' },
    medium: { chip: 'bg-orange-500/15 text-orange-500',   label: 'Média' },
    low:    { chip: 'bg-muted text-muted-foreground',      label: 'Baixa' },
};

const BUDGET_STATUS_STYLE: Record<BudgetStatus, { bar: string; text: string }> = {
    'NORMAL':   { bar: 'bg-success',     text: 'text-success' },
    'ATENÇÃO':  { bar: 'bg-orange-500',  text: 'text-orange-500' },
    'EXCEDIDO': { bar: 'bg-destructive', text: 'text-destructive' },
    'CRÍTICO':  { bar: 'bg-red-700',     text: 'text-red-700' },
};

const brl = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

interface SummaryShape { totalBalance: number; totalIncome: number; totalExpenses: number; trend?: number | null; trendDirection?: string | null; }

const SectionTitle = ({ icon: Icon, children }: { icon: typeof BarChart3; children: React.ReactNode }) => (
    <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
        <Icon className="h-4 w-4" /> {children}
    </h2>
);

const Skeleton = () => (
    <div className="glass-card rounded-2xl p-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
);

const Empty = ({ text }: { text: string }) => (
    <div className="glass-card rounded-2xl p-10 text-center text-muted-foreground text-sm">{text}</div>
);

export default function InsightsFinanceiros() {
    const { score, loading: scoreLoading } = useScore();
    const { patterns, loading: patternsLoading } = usePatterns();
    const { budgets, loading: budgetsLoading } = useBudgets();
    const [summary, setSummary] = useState<SummaryShape | null>(null);
    const [summaryLoading, setSummaryLoading] = useState(true);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const s = await getFinanceSummary();
                if (active) setSummary(s);
            } catch (e) {
                console.error('Erro ao carregar resumo financeiro:', e);
            } finally {
                if (active) setSummaryLoading(false);
            }
        })();
        return () => { active = false; };
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-fade-in">
            <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary"><BarChart3 className="h-5 w-5" /></div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Insights Financeiros</h1>
                    <p className="text-sm text-muted-foreground">Score, padrões detectados, orçamentos e resumo — em um só lugar</p>
                </div>
            </div>

            {/* 1. Score Financeiro */}
            <section className="space-y-3">
                <SectionTitle icon={TrendingUp}>Score Financeiro</SectionTitle>
                <ScoreCard data={score} loading={scoreLoading} />
            </section>

            {/* 2. Padrões Detectados */}
            <section className="space-y-3">
                <SectionTitle icon={AlertTriangle}>Padrões Detectados</SectionTitle>
                {patternsLoading ? <Skeleton /> : patterns.length === 0 ? (
                    <Empty text="Nenhum padrão detectado nos últimos 90 dias." />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {patterns.map((p, i) => {
                            const s = SEV_STYLE[p.severity] || SEV_STYLE.low;
                            return (
                                <div key={`${p.category}-${p.detectedAt}-${i}`} className="glass-card rounded-2xl p-5">
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                        <div>
                                            <p className="font-bold">{p.category}</p>
                                            <p className="text-xs text-muted-foreground">{fmtDate(p.detectedAt)}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-destructive tabular-nums">+{p.percentage}%</span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${s.chip}`}>{s.label}</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">{p.message}</p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* 3. Orçamentos */}
            <section className="space-y-3">
                <SectionTitle icon={Wallet}>Orçamentos</SectionTitle>
                {budgetsLoading ? <Skeleton /> : budgets.length === 0 ? (
                    <Empty text="Nenhum orçamento definido." />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {budgets.map((b) => {
                            const st = BUDGET_STATUS_STYLE[b.status];
                            const barPct = Math.min(100, b.pct);
                            return (
                                <div key={b.id} className="glass-card rounded-2xl p-5">
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                        <div>
                                            <p className="font-bold">{b.category}</p>
                                            <p className="text-sm text-muted-foreground tabular-nums">{brl(b.spent)} / {brl(b.monthlyLimit)}</p>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${st.text} bg-current/10`}>{b.status}</span>
                                    </div>
                                    <div className="h-2.5 w-full rounded-full bg-muted/60 overflow-hidden">
                                        <div className={`h-full rounded-full ${st.bar} transition-all`} style={{ width: `${barPct}%` }} />
                                    </div>
                                    <span className={`text-xs font-bold ${st.text}`}>{b.pct}% consumido</span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* 4. Resumo Financeiro */}
            <section className="space-y-3">
                <SectionTitle icon={BarChart3}>Resumo Financeiro</SectionTitle>
                {summaryLoading || !summary ? <Skeleton /> : (
                    <SummaryCards
                        totalBalance={summary.totalBalance}
                        totalIncome={summary.totalIncome}
                        totalExpenses={summary.totalExpenses}
                        trend={summary.trend}
                        trendDirection={summary.trendDirection}
                    />
                )}
            </section>
        </div>
    );
}
