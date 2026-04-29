import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useState, useEffect } from 'react';
import { getFinanceChart } from '../services/financeService';

export const FinanceCharts = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        async function fetchData() {
            try {
                const res = await getFinanceChart();
                setData(res);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        
        fetchData();

        // Escuta atualizações globais de finanças para recarregar o gráfico
        window.addEventListener('finance-updated', fetchData);
        return () => {
            window.removeEventListener('finance-updated', fetchData);
        };
    }, []);

    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    if (loading) {
        return (
            <div className="p-6 md:p-8 glass-card rounded-2xl animate-pulse">
                <div className="h-8 bg-muted rounded w-1/3 mb-8"></div>
                <div className="flex gap-4 md:gap-8 mb-6">
                    <div className="h-12 w-24 bg-muted rounded"></div>
                    <div className="h-12 w-24 bg-muted rounded"></div>
                    <div className="h-12 w-32 bg-muted rounded"></div>
                </div>
                <div className="h-[350px] bg-muted/50 rounded-xl w-full mt-6"></div>
            </div>
        );
    }

    if (!data || !data.dailyData) {
        return (
            <div className="h-[300px] w-full glass-card rounded-2xl flex items-center justify-center">
                <p className="text-muted-foreground text-sm">Nenhum dado ainda — adicione sua primeira transação.</p>
            </div>
        );
    }

    if (!mounted) return null;

    let runningBalance = data.userMonthlyIncome || 0;
    const pastData = data.dailyData.map((d: any) => {
        runningBalance += (d.income || 0) - (d.expenses || 0);
        return {
            date: d.date,
            income: d.income === 0 ? null : d.income,
            expenses: d.expenses === 0 ? null : d.expenses,
            projected: null,
            balance: runningBalance
        };
    });

    const futureData = data.predictedData.map((d: any) => {
        runningBalance -= (d.projectedExpenses || 0);
        return {
            date: d.date,
            income: null,
            expenses: null,
            projected: d.projectedExpenses,
            balance: runningBalance
        };
    });

    const chartData = [...pastData, ...futureData];

    // Totals calculated from actual arrays (Mock or API logic compatible)
    const totals = {
        income: pastData.reduce((acc: number, curr: any) => acc + (curr.income || 0), 0),
        expenses: pastData.reduce((acc: number, curr: any) => acc + (curr.expenses || 0), 0),
        projected: pastData.reduce((acc: number, curr: any) => acc + (curr.expenses || 0), 0) + futureData.reduce((acc: number, curr: any) => acc + (curr.projected || 0), 0)
    };



    return (
        <div className="p-6 md:p-8 glass-card rounded-2xl">
            <div className="mb-8">
                <h2 className="text-xl font-bold tracking-tight mb-4">Previsão Visual do Status Financeiro</h2>
                
                <div className="flex flex-wrap gap-4 md:gap-8 items-center bg-background/50 p-4 rounded-xl border border-border/50 shadow-inner">
                    <div>
                        <p className="text-xs focus:outline-none uppercase tracking-wider font-bold text-muted-foreground mb-1">💰 Ganhos</p>
                        <p className="font-bold text-success text-base">{formatCurrency(totals.income)}</p>
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1">💸 Gastos Reais</p>
                        <p className="font-bold text-destructive text-base">{formatCurrency(totals.expenses)}</p>
                    </div>
                    <div className="hidden md:block w-px h-10 bg-border/50"></div>
                    <div>
                        <p className="text-xs uppercase tracking-wider font-bold text-primary mb-1 flex items-center gap-1">
                            <span>🔮</span> Projeção Final Base
                        </p>
                        <p className="font-bold text-primary text-base">{formatCurrency(totals.projected)}</p>
                    </div>
                    {totals.projected > totals.income && (
                        <div className="w-full mt-2 md:mt-0 md:w-auto md:ml-auto">
                            <span className="text-xs font-bold text-destructive bg-destructive/10 px-3 py-1.5 rounded-md flex gap-2">
                                ⚠️ Cuidado: O mês pode fechar no negativo. Cortar gastos!
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div style={{ width: '100%', height: 350 }} className="mt-6">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                            tickFormatter={(value) => `R$ ${value}`}
                        />
                        <Tooltip
                            contentStyle={{
                                borderRadius: '12px',
                                border: '1px solid hsl(var(--border))',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                backgroundColor: 'hsl(var(--card))',
                                color: 'hsl(var(--foreground))',
                                fontSize: '13px',
                                fontWeight: 'bold'
                            }}
                            formatter={(value: any) => [formatCurrency(value), '']}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', paddingTop: '20px' }} />

                        {/* 🟢 Ganhos */}
                        <Line
                            type="monotone"
                            dataKey="income"
                            stroke="#22c55e"
                            strokeWidth={3}
                            name="Receitas Reais"
                            dot={{ r: 4, strokeWidth: 2 }}
                            activeDot={{ r: 6 }}
                        />

                        {/* 🔴 Gastos */}
                        <Line
                            type="monotone"
                            dataKey="expenses"
                            stroke="#ef4444"
                            strokeWidth={3}
                            name="Saídas Reais"
                            dot={{ r: 4, strokeWidth: 2 }}
                            activeDot={{ r: 6 }}
                        />

                        {/* 🟣 Saldo acumulado */}
                        <Line
                            type="monotone"
                            dataKey="balance"
                            stroke="#a78bfa"
                            strokeWidth={3}
                            name="Saldo Líquido Adquirido"
                            dot={false}
                        />

                        {/* 🔮 Projeção */}
                        <Line
                            type="monotone"
                            dataKey="projected"
                            stroke="#60a5fa"
                            strokeDasharray="6 6"
                            strokeWidth={3}
                            name="Projeção IA Futura"
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
