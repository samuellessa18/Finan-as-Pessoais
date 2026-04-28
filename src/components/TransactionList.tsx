import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, TrendingUp, TrendingDown, Tag, Calendar, ListFilter } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Transaction {
    id: string;
    description: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    date: string;
}

interface TransactionListProps {
    transactions: Transaction[];
    onDelete: (id: string) => void;
}

export const TransactionList = ({ transactions, onDelete }: TransactionListProps) => {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    return (
        <div className="glass-card rounded-2xl overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-border/50 bg-card/40 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold tracking-tight">Histórico de Transações</h2>
                    <p className="text-xs text-muted-foreground mt-1">Acompanhe suas atividades financeiras</p>
                </div>
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg">
                    <ListFilter className="h-3 w-3" />
                    <span>{transactions.length} {transactions.length === 1 ? 'item' : 'itens'}</span>
                </div>
            </div>

            <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                    <thead className="text-[10px] text-muted-foreground uppercase tracking-widest bg-muted/30">
                        <tr>
                            <th className="px-6 py-4 font-bold border-b border-border/50">Descrição</th>
                            <th className="px-6 py-4 font-bold border-b border-border/50">Data</th>
                            <th className="px-6 py-4 font-bold border-b border-border/50">Valor</th>
                            <th className="px-6 py-4 font-bold border-b border-border/50 text-right">Ação</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                        <AnimatePresence initial={false}>
                            {transactions.length === 0 ? (
                                <motion.tr
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <td colSpan={4} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-3 opacity-50">
                                            <ListFilter className="h-10 w-10 text-muted-foreground" />
                                            <p className="text-sm font-medium text-muted-foreground">Nenhuma transação registrada</p>
                                        </div>
                                    </td>
                                </motion.tr>
                            ) : (
                                transactions.map((t) => (
                                    <motion.tr
                                        key={t.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.98 }}
                                        className="group hover:bg-muted/40 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2.5 rounded-xl transition-transform group-hover:scale-105 ${t.type === 'income' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                                                    {t.type === 'income' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm tracking-tight text-foreground">{t.description}</p>
                                                    <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                                                        <Tag className="h-3 w-3 opacity-70" /> {t.category}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                                <Calendar className="h-4 w-4 opacity-70" />
                                                {format(new Date(t.date), "dd 'de' MMM", { locale: ptBR })}
                                            </div>
                                        </td>
                                        <td className={`px-6 py-4 font-bold text-sm tabular-nums whitespace-nowrap ${t.type === 'income' ? 'text-success' : 'text-destructive'}`}>
                                            {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => onDelete(t.id)}
                                                className="p-2.5 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 bg-background/50 rounded-xl transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                                                title="Excluir Transação"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>
        </div>
    );
};
