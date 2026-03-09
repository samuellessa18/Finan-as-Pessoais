import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

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

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.4 }}
                className="p-6 rounded-2xl glass-card gradient-blue text-white shadow-xl overflow-hidden relative"
            >
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-blue-100 text-sm font-medium">Saldo Total</span>
                        <DollarSign className="h-5 w-5 text-blue-200" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight">{formatCurrency(totalBalance)}</h2>
                </div>
                <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-white/10 rounded-full blur-2xl" />
            </motion.div>

            <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.4, delay: 0.1 }}
                className="p-6 rounded-2xl glass-card gradient-green text-white shadow-xl overflow-hidden relative"
            >
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-emerald-100 text-sm font-medium">Receitas</span>
                        <TrendingUp className="h-5 w-5 text-emerald-200" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight">{formatCurrency(totalIncome)}</h2>
                </div>
                <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-white/10 rounded-full blur-2xl" />
            </motion.div>

            <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.4, delay: 0.2 }}
                className="p-6 rounded-2xl glass-card gradient-red text-white shadow-xl overflow-hidden relative"
            >
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-red-100 text-sm font-medium">Despesas</span>
                        <TrendingDown className="h-5 w-5 text-red-200" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight">{formatCurrency(totalExpenses)}</h2>
                </div>
                <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-white/10 rounded-full blur-2xl" />
            </motion.div>
        </div>
    );
};
