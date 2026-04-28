import { useTransactions } from '@/hooks/useTransactions';
import { useAuth } from '@/contexts/AuthContext';
import { SummaryCards } from '@/components/SummaryCards';
import { TransactionForm } from '@/components/TransactionForm';
import { TransactionList } from '@/components/TransactionList';
import { FinanceCharts } from '@/components/FinanceCharts';
import { Brain, ShieldCheck, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGamification } from '@/contexts/GamificationContext';
import { useState } from 'react';
import { performCheckIn } from '@/services/userService';

const Index = () => {
    const { transactions, addTransaction, deleteTransaction, summary, loading } = useTransactions();
    const { user } = useAuth();
    const { xp, level, streakDays, progressToNextLevel, currentLevelXp, xpForNextLevel, refreshGamification } = useGamification();
    const [checkingIn, setCheckingIn] = useState(false);

    const handleCheckIn = async () => {
        try {
            setCheckingIn(true);
            await performCheckIn();
            await refreshGamification();
        } catch (error) {
            console.error("Erro no check-in:", error);
        } finally {
            setCheckingIn(false);
        }
    };

    const handleAddTransaction = async (tx: any) => {
        await addTransaction(tx);
        await refreshGamification();
    };

    const handleDeleteTransaction = async (id: string) => {
        await deleteTransaction(id);
        await refreshGamification();
    };

    const displayName = user?.user_metadata?.full_name || user?.email || 'Usuário';

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <img src="/logo.png" alt="FinMind Logo" className="h-10 w-10 animate-bounce object-contain" />
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-6 animate-fade-in">
            {/* Hero & Insights Row */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* Hero Feature */}
                <div className="xl:col-span-2 glass-card p-6 md:p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-10 pointer-events-none">
                        <ShieldCheck className="h-48 w-48" />
                    </div>
                    <div className="relative z-10">
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
                            Sua vida financeira, sob controle absoluto.
                        </h1>
                        <p className="text-muted-foreground mb-6">
                            Bem-vindo de volta, {displayName.split(' ')[0]}. Você tem {transactions.length} registros seguros na plataforma.
                        </p>
                        <div className="inline-flex items-center gap-2 text-xs font-bold text-success bg-success/10 px-3 py-1.5 rounded-lg">
                            <ShieldCheck className="h-4 w-4" />
                            Ambiente Criptografado
                        </div>
                    </div>
                </div>

                {/* AI Insight Teaser */}
                <div className="glass-card p-6 rounded-2xl border-t-4 border-t-primary flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="p-1.5 rounded-lg bg-primary/10">
                                <Brain className="h-4 w-4 text-primary" />
                            </div>
                            <h2 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Insights de Hoje</h2>
                        </div>
                        <p className="text-sm font-medium leading-relaxed">
                            Notamos que você reduziu seus gastos gerais em <span className="text-success font-bold">12%</span> neste mês. Fique de olho no seu painel de planejamentos!
                        </p>
                    </div>
                    <Link to="/insights" className="text-primary text-sm font-semibold hover:underline flex items-center gap-1 mt-4">
                        Consultar IA Financeira &rarr;
                    </Link>
                </div>
            </div>

            {/* Gamification Hub */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                
                {/* Progress & XP Card */}
                <div className="lg:col-span-2 glass-card p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden bg-gradient-to-tr from-card to-primary/5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold tracking-tight">Sua Evolução Financeira</h2>
                        <span className="bg-primary text-primary-foreground text-xs font-black uppercase tracking-wider px-3 py-1 rounded-md shadow-lg shadow-primary/20">
                            Nível {level}
                        </span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 h-full">
                        <div className="flex-1 flex flex-col gap-2 justify-center bg-card/60 backdrop-blur p-4 rounded-xl border border-border/50">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 shrink-0 bg-orange-500/10 flex items-center justify-center rounded-xl border border-orange-500/20">
                                    <span className="text-lg">🔥</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-foreground">{streakDays} dias consistentes</p>
                                    <button 
                                        onClick={handleCheckIn}
                                        disabled={checkingIn}
                                        className="text-[10px] bg-orange-500 text-white font-bold px-2 py-0.5 rounded mt-1 hover:bg-orange-600 disabled:opacity-50 transition-colors flex items-center gap-1"
                                    >
                                        < Zap className="h-2 w-2" /> {checkingIn ? 'Salvando...' : 'Check-in Diário'}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col gap-2 justify-center bg-card/60 backdrop-blur p-4 rounded-xl border border-border/50">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 shrink-0 bg-yellow-500/10 flex items-center justify-center rounded-xl border border-yellow-500/20">
                                    <span className="text-lg">🏆</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-foreground flex justify-between">
                                        <span>+{currentLevelXp} XP</span>
                                    </p>
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground mt-1 mb-1.5 flex justify-between">
                                        <span>Ganhos do Nível</span>
                                        <span>{xp}/{xpForNextLevel}</span>
                                    </p>
                                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                        <div 
                                          className="h-full bg-yellow-500 rounded-full shadow-[0_0_10px_rgba(234,179,8,0.5)] transition-all duration-1000"
                                          style={{ width: `${progressToNextLevel}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Badges Vault */}
                <div className="glass-card p-6 rounded-2xl flex flex-col border-t-4 border-t-accent">
                    <h2 className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-4 text-center">Suas Conquistas</h2>
                    <div className="flex flex-col gap-4 flex-1 justify-center">
                        <div className="flex items-center gap-3 bg-muted/20 p-2.5 rounded-xl border border-border/30">
                            <div className="h-10 w-10 flex-shrink-0 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 text-xl shadow-inner">
                                🧠
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-bold leading-tight">Mestre da Prevenção</p>
                                <p className="text-[10px] text-muted-foreground font-medium mt-0.5">Evitou &gt;50% impulsos</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-muted/20 p-2.5 rounded-xl border border-border/30">
                            <div className="h-10 w-10 flex-shrink-0 bg-orange-500/10 rounded-full flex items-center justify-center border border-orange-500/20 text-xl shadow-inner">
                                🎯
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-bold leading-tight">Focado</p>
                                <p className="text-[10px] text-muted-foreground font-medium mt-0.5">Meta ativa há 30 dias</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Behavioral Quest Mini */}
                <div className="glass-card p-6 rounded-2xl flex flex-col justify-between border-t-4 border-t-primary">
                    <div>
                        <h2 className="text-xs uppercase tracking-wider font-black text-primary mb-2 flex items-center gap-1.5">
                            Quest Ativa
                        </h2>
                        <h3 className="text-lg font-bold tracking-tight mb-1 flex items-center gap-1.5">🍔 Alimentação</h3>
                        <p className="text-xs text-muted-foreground font-medium mb-3">
                            Representa <strong className="text-foreground text-sm">35%</strong> dos gastos hoje.
                        </p>
                    </div>
                    <div className="bg-primary/10 border border-primary/20 p-3 rounded-xl mt-auto">
                        <p className="text-[11px] text-primary font-bold leading-relaxed">
                            🎯 Reduzir 10% nesse fim de semana te garante <strong className="text-foreground bg-background px-1 rounded mx-0.5">+120 XP</strong> e acelera sua Viagem!
                        </p>
                    </div>
                </div>
            </div>

            {/* Financial Overview Metrics */}
            <SummaryCards 
                totalBalance={summary.totalBalance + (user?.monthlyIncome || 0)} 
                totalIncome={summary.totalIncome + (user?.monthlyIncome || 0)} 
                totalExpenses={summary.totalExpenses} 
            />
            
            {/* Visual Analytics */}
            <FinanceCharts />
            
            {/* Transactions Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <TransactionForm onAdd={handleAddTransaction} />
                </div>
                <div className="lg:col-span-2">
                    <TransactionList transactions={transactions} onDelete={handleDeleteTransaction} />
                </div>
            </div>
        </div>
    );
};

export default Index;
