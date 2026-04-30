import { useState } from 'react';
import { PlusCircle, ArrowUpCircle, ArrowDownCircle, WalletCards, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';

interface TransactionFormProps {
    onAdd: (transaction: any) => void;
}

export const TransactionForm = ({ onAdd }: TransactionFormProps) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [category, setCategory] = useState('Geral');

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || !amount) return;

        try {
            setLoading(true);
            await onAdd({
                description,
                amount: parseFloat(amount),
                type,
                category,
                date: new Date().toISOString(),
            });

            setDescription('');
            setAmount('');
            toast.success('Transação registrada com sucesso!');
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
                        onClick={() => setType('income')}
                        className={`w-full transition-all h-11 ${type === 'income' ? 'bg-success hover:bg-success/90 text-success-foreground border-transparent shadow-sm shadow-success/20' : 'border-border/50 text-muted-foreground hover:bg-success/10 hover:text-success'}`}
                    >
                        <ArrowUpCircle className="mr-2 h-4 w-4" /> Entrada
                    </Button>
                    <Button
                        type="button"
                        variant={type === 'expense' ? 'default' : 'outline'}
                        onClick={() => setType('expense')}
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
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Valor (R$)</label>
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
                    <input
                        type="text"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="Ex: Alimentação, Lazer..."
                        className="w-full px-4 py-3 rounded-xl border border-border/50 bg-background/50 focus:bg-background focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                    />
                </div>
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
