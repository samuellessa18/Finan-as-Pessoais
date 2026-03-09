import { useState } from 'react';
import { Button } from './ui/button';
import { PlusCircle, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

interface TransactionFormProps {
    onAdd: (transaction: any) => void;
}

export const TransactionForm = ({ onAdd }: TransactionFormProps) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [category, setCategory] = useState('Geral');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || !amount) return;

        onAdd({
            description,
            amount: parseFloat(amount),
            type,
            category,
            date: new Date().toISOString(),
        });

        setDescription('');
        setAmount('');
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 space-y-5 rounded-2xl border border-border bg-card/60 backdrop-blur-sm shadow-sm">
            <div>
                <h2 className="text-lg font-semibold tracking-tight">Nova Transação</h2>
                <p className="text-sm text-muted-foreground">Registre uma nova entrada ou saída.</p>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                    <Button
                        type="button"
                        variant={type === 'income' ? 'default' : 'outline'}
                        onClick={() => setType('income')}
                        className={`w-full transition-all ${type === 'income' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                    >
                        <ArrowUpCircle className="mr-2 h-4 w-4" /> Entrada
                    </Button>
                    <Button
                        type="button"
                        variant={type === 'expense' ? 'default' : 'outline'}
                        onClick={() => setType('expense')}
                        className={`w-full transition-all ${type === 'expense' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                    >
                        <ArrowDownCircle className="mr-2 h-4 w-4" /> Saída
                    </Button>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Descrição</label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Ex: Supermercado, Salário..."
                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Valor (R$)</label>
                    <input
                        type="number"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0,00"
                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Categoria</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none"
                    >
                        <option>Geral</option>
                        <option>Alimentação</option>
                        <option>Transporte</option>
                        <option>Lazer</option>
                        <option>Saúde</option>
                        <option>Outros</option>
                    </select>
                </div>
            </div>

            <Button type="submit" className="w-full rounded-xl py-6 text-base font-semibold">
                <PlusCircle className="mr-2 h-5 w-5" /> Adicionar Transação
            </Button>
        </form>
    );
};
