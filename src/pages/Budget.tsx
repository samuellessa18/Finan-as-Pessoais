import { useState } from 'react';
import { toast } from 'sonner';
import { Wallet, Plus, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { EXPENSE_CATEGORIES } from '../constants/categories';
import { useBudgets } from '../hooks/useBudgets';
import { upsertBudget, deleteBudget, type BudgetStatus } from '../services/budgetService';

const errMsg = (e: unknown, fallback: string): string =>
    (e as { response?: { data?: { error?: string } } })?.response?.data?.error || fallback;

const STATUS_STYLE: Record<BudgetStatus, { bar: string; text: string; chip: string }> = {
    'NORMAL':   { bar: 'bg-success',      text: 'text-success',      chip: 'bg-success/15 text-success' },
    'ATENÇÃO':  { bar: 'bg-orange-500',   text: 'text-orange-500',   chip: 'bg-orange-500/15 text-orange-500' },
    'EXCEDIDO': { bar: 'bg-destructive',  text: 'text-destructive',  chip: 'bg-destructive/15 text-destructive' },
    'CRÍTICO':  { bar: 'bg-red-700',      text: 'text-red-700',      chip: 'bg-red-700/15 text-red-700' },
};

const brl = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export default function Budget() {
    const { budgets, loading, reload } = useBudgets();
    const [category, setCategory] = useState('');
    const [limit, setLimit] = useState('');
    const [saving, setSaving] = useState(false);
    const [busyId, setBusyId] = useState<string | null>(null);

    const used = new Set(budgets.map((b) => b.category));
    const available = EXPENSE_CATEGORIES.filter((c) => !used.has(c));

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        const value = parseFloat(limit);
        if (!category) { toast.error('Selecione uma categoria.'); return; }
        if (!Number.isFinite(value) || value <= 0) { toast.error('Informe um limite válido.'); return; }
        try {
            setSaving(true);
            await upsertBudget(category, value);
            toast.success('Orçamento definido.');
            setCategory(''); setLimit('');
            await reload();
        } catch (e2) {
            toast.error(errMsg(e2, 'Falha ao salvar orçamento.'));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string, cat: string) => {
        if (!window.confirm(`Remover o orçamento de ${cat}?`)) return;
        try {
            setBusyId(id);
            await deleteBudget(id);
            toast.success('Orçamento removido.');
            await reload();
        } catch (e) {
            toast.error(errMsg(e, 'Falha ao remover.'));
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary"><Wallet className="h-5 w-5" /></div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Orçamento por Categoria</h1>
                    <p className="text-sm text-muted-foreground">Defina limites mensais e acompanhe o consumo</p>
                </div>
            </div>

            {/* Definir novo limite */}
            <form onSubmit={handleAdd} className="glass-card rounded-2xl p-5 flex flex-col sm:flex-row gap-3 sm:items-end">
                <div className="flex-1 space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Categoria</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-border/50 bg-background/50 outline-none text-sm">
                        <option value="" disabled>Selecione...</option>
                        {available.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div className="flex-1 space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Limite mensal (R$)</label>
                    <input type="number" step="0.01" value={limit} onChange={(e) => setLimit(e.target.value)} placeholder="0,00"
                        className="w-full px-4 py-2.5 rounded-xl border border-border/50 bg-background/50 outline-none text-sm" />
                </div>
                <button type="submit" disabled={saving || available.length === 0}
                    className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center gap-2 disabled:opacity-50">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Definir
                </button>
            </form>

            {/* Lista de orçamentos */}
            {loading ? (
                <div className="glass-card rounded-2xl p-16 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : budgets.length === 0 ? (
                <div className="glass-card rounded-2xl p-16 text-center text-muted-foreground text-sm">Nenhum orçamento definido ainda.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {budgets.map((b) => {
                        const s = STATUS_STYLE[b.status];
                        const barPct = Math.min(100, b.pct);
                        return (
                            <div key={b.id} className="glass-card rounded-2xl p-5">
                                <div className="flex items-start justify-between gap-3 mb-2">
                                    <div>
                                        <p className="font-bold">{b.category}</p>
                                        <p className="text-sm text-muted-foreground tabular-nums">{brl(b.spent)} / {brl(b.monthlyLimit)}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${s.chip}`}>{b.status}</span>
                                        <button onClick={() => handleDelete(b.id, b.category)} disabled={busyId === b.id}
                                            className="p-1.5 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 rounded-lg">
                                            {busyId === b.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="h-2.5 w-full rounded-full bg-muted/60 overflow-hidden">
                                    <div className={`h-full rounded-full ${s.bar} transition-all`} style={{ width: `${barPct}%` }} />
                                </div>
                                <div className="mt-1.5 flex items-center justify-between">
                                    <span className={`text-xs font-bold ${s.text}`}>{b.pct}%</span>
                                    {b.forecast.willExceed && <AlertTriangle className={`h-3.5 w-3.5 ${s.text}`} />}
                                </div>
                                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{b.forecastMessage}</p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
