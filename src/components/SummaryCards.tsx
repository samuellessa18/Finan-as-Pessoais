import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';

interface SummaryCardsProps {
    totalBalance: number;
    totalIncome: number;
    totalExpenses: number;
}

export const SummaryCards = ({ totalBalance, totalIncome, totalExpenses }: SummaryCardsProps) => {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    const efficiency = totalIncome > 0 ? ((totalExpenses / totalIncome) * 100).toFixed(1) : '0.0';

    const cardVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.3 }}
                className="p-5 sm:p-6 rounded-2xl glass-card relative overflow-hidden group"
            >
                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Saldo Líquido</span>
                    <div className="p-2 sm:p-2.5 rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                        <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tighter tabular-nums truncate" title={formatCurrency(totalBalance)}>
                    {formatCurrency(totalBalance)}
                </h2>
            </motion.div>

            <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.3, delay: 0.1 }}
                className="p-5 sm:p-6 rounded-2xl glass-card relative overflow-hidden group"
            >
                <div className="absolute top-0 left-0 w-1 h-full bg-success" />
                <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Entradas</span>
                    <div className="p-2 sm:p-2.5 rounded-full bg-success/10 text-success group-hover:scale-110 transition-transform">
                        <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tighter tabular-nums truncate text-success" title={formatCurrency(totalIncome)}>
                    {formatCurrency(totalIncome)}
                </h2>
            </motion.div>

            <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.3, delay: 0.2 }}
                className="p-5 sm:p-6 rounded-2xl glass-card relative overflow-hidden group"
            >
                <div className="absolute top-0 left-0 w-1 h-full bg-destructive" />
                <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Saídas</span>
                    <div className="p-2 sm:p-2.5 rounded-full bg-destructive/10 text-destructive group-hover:scale-110 transition-transform">
                        <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tighter tabular-nums truncate text-destructive" title={formatCurrency(totalExpenses)}>
                    {formatCurrency(totalExpenses)}
                </h2>
            </motion.div>

            <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.3, delay: 0.3 }}
                className="p-5 sm:p-6 rounded-2xl glass-card relative overflow-hidden group"
            >
                <div className="absolute top-0 left-0 w-1 h-full bg-accent" />
                <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Eficiência</span>
                    <div className="p-2 sm:p-2.5 rounded-full bg-accent/20 text-accent-foreground group-hover:scale-110 transition-transform">
                        <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                </div>
                <div className="flex items-baseline gap-2">
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tighter tabular-nums">
                        {efficiency}%
                    </h2>
                    <span className="text-xs text-muted-foreground">gasto/receita</span>
                </div>
            </motion.div>
        </div>
    );
};
