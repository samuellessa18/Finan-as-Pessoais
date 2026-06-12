import { useState } from 'react';
import { PlusCircle, ArrowUpCircle, ArrowDownCircle, WalletCards, Loader2, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants/categories';

interface TransactionFormProps {
    onAdd: (transaction: any) => void;
    onAddInstallments?: (data: {
        description: string;
        category: string;
        totalAmount: number;
        installments: number;
    }) => Promise<void> | void;
}

const formatBRL = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const monthYear = (monthsAhead: number) => {
    const now = new Date();
    // Dia 1 evita rolagem de mês (31/jan + 1 mês ≠ março); só exibimos MM/AAAA.
    const d = new Date(now.getFullYear(), now.getMonth() + monthsAhead, 1);
    return `${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

export const TransactionForm = ({ onAdd, onAddInstallments }: TransactionFormProps) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [category, setCategory] = useState('');
    const [isInstallment, setIsInstallment] = useState(false);
    const [installments, setInstallments] = useState('');

    const [loading, setLoading] = useState(false);

    const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

    const totalValue = parseFloat(amount);
    const installmentsCount = parseInt(installments, 10);
    const previewReady =
        isInstallment &&
        Number.isFinite(totalValue) && totalValue > 0 &&
        Number.isInteger(installmentsCount) && installmentsCount >= 2 && installmentsCount <= 60;
    // Mesmo arredondamento do backend: N-1 parcelas "base"; a última fecha a soma.
    const baseInstallment = previewReady
        ? Math.floor((totalValue / installmentsCount) * 100) / 100
        : 0;

    const switchType = (next: 'income' | 'expense') => {
        setType(next);
        setCategory('');
        if (next === 'income') setIsInstallment(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || !amount) return;
        if (!category) {
            toast.error('Selecione uma categoria.');
            return;
        }

        try {
            setLoading(true);

            if (isInstallment && type === 'expense') {
                if (!previewReady) {
                    toast.error('Informe o valor total e de 2 a 60 parcelas.');
                    return;
                }
                await onAddInstallments?.({
                    description,
                    category,
                    totalAmount: totalValue,
                    installments: installmentsCount,
                });
                toast.success(`Compra parcelada registrada: ${installmentsCount}x de ${formatBRL(baseInstallment)}`);
            } else {
                await onAdd({
                    description,
                    amount: totalValue,
                    type,
                    category,
                    date: new Date().toISOString(),
                });
                toast.success('Transação registrada com sucesso!');
            }

            setDescription('');
            setAmount('');
            setInstallments('');
            setIsInstallment(false);
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Erro ao registrar transação.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 space-y-6 rounded-2xl glass-card">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                    <WalletCards className="h-5 w-5" />
                </div>
                <div>
                    <h2 className="text-lg font-bold tracking-tight leading-none">Nova Transação</h2>
                    <p className="text-xs text-muted-foreground mt-1">Registre uma entrada ou saída no sistema</p>
                </div>
            </div>

            <div className="space-y-5">
                <div className="grid grid-cols-2 gap-3">
                    <Button
                        type="button"
                        variant={type === 'income' ? 'default' : 'outline'}
                        onClick={() => switchType('income')}
                        className={`w-full transition-all h-11 ${type === 'income' ? 'bg-success hover:bg-success/90 text-success-foreground border-transparent shadow-sm shadow-success/20' : 'border-border/50 text-muted-foreground hover:bg-success/10 hover:text-success'}`}
                    >
                        <ArrowUpCircle className="mr-2 h-4 w-4" /> Entrada
                    </Button>
                    <Button
                        type="button"
                        variant={type === 'expense' ? 'default' : 'outline'}
                        onClick={() => switchType('expense')}
                        className={`w-full transition-all h-11 ${type === 'expense' ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground border-transparent shadow-sm shadow-destructive/20' : 'border-border/50 text-muted-foreground hover:bg-destructive/10 hover:text-destructive'}`}
                    >
                        <ArrowDownCircle className="mr-2 h-4 w-4" /> Saída
                    </Button>
                </div>

                <div className="space-y-1.5 focus-within:text-primary transition-colors">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Descrição</label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Ex: Supermercado, Salário..."
                        className="w-full px-4 py-3 rounded-xl border border-border/50 bg-background/50 focus:bg-background focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                    />
                </div>

                <div className="space-y-1.5 focus-within:text-primary transition-colors">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
                        {isInstallment ? 'Valor Total (R$)' : 'Valor (R$)'}
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0,00"
                        className="w-full px-4 py-3 rounded-xl border border-border/50 bg-background/50 focus:bg-background focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                    />
                </div>

                <div className="space-y-1.5 focus-within:text-primary transition-colors">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Categoria</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-border/50 bg-background/50 focus:bg-background focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                    >
                        <option value="" disabled>Selecione a categoria...</option>
                        {categories.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>

                {type === 'expense' && (
                    <div className="space-y-3 rounded-xl border border-border/50 bg-background/40 p-4">
                        <label className="flex items-center gap-3 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={isInstallment}
                                onChange={(e) => setIsInstallment(e.target.checked)}
                                className="h-4 w-4 accent-primary"
                            />
                            <span className="flex items-center gap-2 text-sm font-semibold">
                                <CreditCard className="h-4 w-4 text-primary" /> Compra parcelada
                            </span>
                        </label>

                        {isInstallment && (
                            <>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Quantidade de Parcelas</label>
                                    <input
                                        type="number"
                                        min={2}
                                        max={60}
                                        step={1}
                                        value={installments}
                                        onChange={(e) => setInstallments(e.target.value)}
                                        placeholder="Ex: 10"
                                        className="w-full px-4 py-3 rounded-xl border border-border/50 bg-background/50 focus:bg-background focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                                    />
                                </div>

                                {previewReady && (
                                    <div className="rounded-lg bg-primary/5 border border-primary/10 px-4 py-3 text-sm space-y-1">
                                        <p className="font-bold text-primary">
                                            {installmentsCount}x de {formatBRL(baseInstallment)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">Primeira parcela: {monthYear(0)}</p>
                                        <p className="text-xs text-muted-foreground">Última parcela: {monthYear(installmentsCount - 1)}</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>

            <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl h-12 text-base font-semibold shadow-md hover:scale-[1.02] transition-transform active:scale-95 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-70"
            >
                {loading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                    <PlusCircle className="mr-2 h-5 w-5" />
                )}
                {loading ? 'Processando...' : 'Confirmar'}
            </Button>
        </form>
    );
};
