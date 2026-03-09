import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { useMemo } from 'react';

interface Transaction {
    date: string;
    amount: number;
    type: 'income' | 'expense';
}

interface FinanceChartsProps {
    transactions: Transaction[];
}

export const FinanceCharts = ({ transactions }: FinanceChartsProps) => {
    const chartData = useMemo(() => {
        // Sort transactions by date
        const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Group by date for the chart
        const dailyData: Record<string, any> = {};

        sorted.forEach(t => {
            const day = format(new Date(t.date), 'dd/MM');
            if (!dailyData[day]) {
                dailyData[day] = { date: day, income: 0, expense: 0 };
            }
            if (t.type === 'income') dailyData[day].income += t.amount;
            else dailyData[day].expense += t.amount;
        });

        return Object.values(dailyData);
    }, [transactions]);

    if (transactions.length === 0) {
        return (
            <div className="h-[300px] w-full bg-card/40 backdrop-blur-md rounded-2xl border border-border border-dashed flex items-center justify-center">
                <p className="text-muted-foreground text-sm">Adicione transações para ver o gráfico de fluxo.</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-card/40 backdrop-blur-md rounded-2xl border border-border shadow-sm">
            <div className="mb-6">
                <h2 className="text-lg font-bold tracking-tight">Fluxo de Caixa</h2>
                <p className="text-sm text-muted-foreground">Evolução de suas receitas e despesas.</p>
            </div>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9CA3AF', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9CA3AF', fontSize: 12 }}
                            tickFormatter={(value) => `R$ ${value}`}
                        />
                        <Tooltip
                            contentStyle={{
                                borderRadius: '12px',
                                border: 'none',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                backgroundColor: 'rgba(255, 255, 255, 0.9)'
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="income"
                            stroke="#10b981"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorIncome)"
                        />
                        <Area
                            type="monotone"
                            dataKey="expense"
                            stroke="#ef4444"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorExpense)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
