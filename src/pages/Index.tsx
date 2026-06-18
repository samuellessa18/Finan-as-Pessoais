import { useTransactions } from '@/hooks/useTransactions';
import { useAuth } from '@/contexts/AuthContext';
import { SummaryCards } from '@/components/SummaryCards';
import { ScoreCard } from '@/components/ScoreCard';
import { useScore } from '@/hooks/useScore';
import { TransactionForm } from '@/components/TransactionForm';
import { TransactionList } from '@/components/TransactionList';
import { FinanceCharts } from '@/components/FinanceCharts';
import { Brain, ShieldCheck, Zap, Trophy, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGamification } from '@/contexts/GamificationContext';
import { useGrowthActions } from '@/hooks/useGrowthActions';
import { useState, useEffect } from 'react';
import { performCheckIn, getEmotionalAnalytics, getInsights, resetUserData } from '@/services/userService';
import { trackBehaviorEvent } from '../services/telemetry';
import { toast } from 'sonner';

const Index = () => {
    const { transactions, addTransaction, addInstallments, deleteTransaction, summary, lastUpdated } = useTransactions();
    const { score, loading: scoreLoading } = useScore(lastUpdated);
    const { user } = useAuth();
    const { xp, level, streakDays, progressToNextLevel, currentLevelXp, xpForNextLevel, refreshGamification } = useGamification();
    
    const { actions: growthActions, markAsCompleted } = useGrowthActions();
    const [analytics, setAnalytics] = useState<any>(null);
    const [insights, setInsights] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [checkingIn, setCheckingIn] = useState(false);

    useEffect(() => {
        async function loadDashboardData() {
            if (!user) return;
            
            try {
                const [analyticsData, insightsData] = await Promise.all([
                    getEmotionalAnalytics(),
                    getInsights()
                ]);
                setAnalytics(analyticsData);
                setInsights(insightsData);
            } catch (error) {
                console.error("Erro ao carregar dados do dashboard:", error);
            } finally {
                setLoading(false);
            }
        }
        loadDashboardData();
    }, [user, lastUpdated]);

    const handleCheckIn = async () => {
        try {
            setCheckingIn(true);
            await performCheckIn();
            await refreshGamification();
            toast.success('Check-in diário realizado! +5 XP');
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Erro no check-in.');
        } finally {
            setCheckingIn(false);
        }
    };

    const handleReset = async () => {
        const confirm = window.confirm(
            "⚠️ ATENÇÃO: Tem certeza que deseja apagar TODOS os seus dados financeiros? Esta ação não pode ser desfeita."
        );

        if (!confirm) return;

        try {
            setLoading(true);
            toast.loading('Limpando seus dados...', { id: 'reset' });
            await resetUserData();
            toast.success('Sistema resetado com sucesso!', { id: 'reset' });
            setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
            toast.error('Erro ao resetar dados.', { id: 'reset' });
        } finally {
            setLoading(false);
        }
    };

    const handleAddTransaction = async (tx: any) => {
        await addTransaction(tx);
        await refreshGamification();
    };

    const handleAddInstallments = async (data: {
        description: string; category: string; totalAmount: number; installments: number;
    }) => {
        await addInstallments(data);
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
            {/* Growth Banners */}
            {growthActions.map((action) => (
                <div key={action.id} className="bg-primary/90 text-primary-foreground p-4 rounded-2xl flex items-center justify-between shadow-lg animate-bounce-subtle">
                    <div className="flex items-center gap-3">
                        <Zap className="h-5 w-5 fill-current" />
                        <div>
                            <p className="font-bold text-sm">Dica Pro: {action.type === 'onboarding_tour' ? 'Comece com o pé direito!' : 'Sentimos sua falta!'}</p>
                            <p className="text-xs opacity-90">Que tal explorar as novas funcionalidades de IA hoje?</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => markAsCompleted(action.id)}
                        className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-xs font-bold transition-colors"
                    >
                        Entendido
                    </button>
                </div>
            ))}

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
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="inline-flex items-center gap-2 text-xs font-bold text-success bg-success/10 px-3 py-1.5 rounded-lg">
                                <ShieldCheck className="h-4 w-4" />
                                Ambiente Criptografado
                            </div>
                             <div className={`inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border shadow-sm ${
                               user?.plan === 'pro' 
                                 ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white border-transparent' 
                                 : 'bg-muted/30 text-muted-foreground border-border/50'
                             }`}>
                                {user?.plan || 'free'}
                             </div>
                             {user?.plan !== 'pro' && (
                                <button 
                                    onClick={() => trackBehaviorEvent('upgrade_clicked', 'header_badge')}
                                    className="text-[10px] font-bold text-primary hover:underline"
                                >
                                    Upgrade
                                </button>
                             )}
                            <button
                                onClick={handleReset}
                                className="text-[10px] uppercase font-black tracking-widest text-destructive hover:bg-destructive/10 border border-destructive/20 px-3 py-1.5 rounded-lg transition-all"
                            >
                                Resetar Sistema
                            </button>
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
                            <h2 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">AI Insight</h2>
                        </div>
                        <p className="text-sm font-medium leading-relaxed italic">
                            {insights.length > 0 
                                ? insights[0].message 
                                : (analytics?.emotional?.preventionMessage || "Aguardando dados suficientes para gerar insights personalizados.")}
                        </p>
                        {analytics?.emotional?.aiUsage && analytics.emotional.aiUsage.current > 0 && (
                            <div className="mt-3 pt-3 border-t border-border/30">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Uso Diário de IA</span>
                                    <span className="text-[10px] font-bold">
                                        {analytics.emotional.aiUsage.current}/{analytics.emotional.aiUsage.limit}
                                    </span>
                                </div>
                                <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full transition-all duration-500 ${
                                            analytics.emotional.aiUsage.current >= analytics.emotional.aiUsage.limit 
                                                ? 'bg-destructive' 
                                                : 'bg-primary'
                                        }`}
                                        style={{ width: `${(analytics.emotional.aiUsage.current / analytics.emotional.aiUsage.limit) * 100}%` }}
                                    ></div>
                                </div>
                                {analytics.emotional.aiUsage.current >= analytics.emotional.aiUsage.limit && (
                                    <div className="mt-2 space-y-2">
                                        <p className="text-[9px] text-destructive font-bold animate-pulse">
                                            Limite diário atingido. Faça upgrade para PRO!
                                        </p>
                                        <button 
                                            onClick={() => {
                                                trackBehaviorEvent('upgrade_clicked', 'ai_limit_reached');
                                                toast.info('Em breve: Planos PRO com IA ilimitada!');
                                            }}
                                            className="w-full text-[10px] bg-primary text-white font-black py-1.5 rounded-lg shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                                        >
                                            DESBLOQUEAR PRO ⚡
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <Link to="/insights" className="text-primary text-sm font-semibold hover:underline flex items-center gap-1 mt-4">
                        Gerar novo Insight &rarr;
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
                    <h2 className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-4 text-center">Conquistas</h2>
                    <div className="flex flex-col gap-4 flex-1 justify-center">
                        {analytics?.emotional?.badges?.length > 0 ? (
                            analytics.emotional.badges.slice(0, 2).map((badge: any, i: number) => (
                                <div key={i} className="flex items-center gap-3 bg-muted/20 p-2.5 rounded-xl border border-border/30">
                                    <div className="h-10 w-10 flex-shrink-0 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 text-xl shadow-inner">
                                        {badge.icon}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-bold leading-tight">{badge.title}</p>
                                        <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{badge.description}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-4 opacity-50">
                                <Trophy className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                <p className="text-[10px] font-bold uppercase tracking-widest">Bloqueado</p>
                                <p className="text-[9px] mt-1">Mantenha a consistência para ganhar badges.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Behavioral Quest Mini */}
                <div className="glass-card p-6 rounded-2xl flex flex-col justify-between border-t-4 border-t-primary">
                    <div>
                        <h2 className="text-xs uppercase tracking-wider font-black text-primary mb-2 flex items-center gap-1.5">
                            Quest Semanal
                        </h2>
                        {analytics?.emotional?.weeklySummary?.highlights?.length > 0 ? (
                            <>
                                <h3 className="text-lg font-bold tracking-tight mb-1 flex items-center gap-1.5">📊 Resumo</h3>
                                <p className="text-xs text-muted-foreground font-medium mb-3">
                                    {analytics.emotional.weeklySummary.highlights[0]}
                                </p>
                                <div className="bg-primary/10 border border-primary/20 p-3 rounded-xl mt-auto">
                                    <p className="text-[11px] text-primary font-bold leading-relaxed">
                                        {analytics.emotional.weeklySummary.conclusion}
                                    </p>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full opacity-50 text-center">
                                <Target className="h-8 w-8 mb-2 text-primary" />
                                <p className="text-[10px] font-bold uppercase">Em Análise</p>
                                <p className="text-[9px] mt-1">Sua primeira quest surge após 3 registros.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Onboarding State: Primeiro Uso */}
            {transactions.length === 0 && (
                <div className="glass-card p-8 rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                        <Brain className="h-32 w-32 rotate-12" />
                    </div>
                    <div className="max-w-2xl">
                        <h2 className="text-3xl font-black tracking-tighter mb-4">Bem-vindo ao <span className="text-primary">FinMind</span>.</h2>
                        <p className="text-lg text-muted-foreground font-medium mb-6 leading-relaxed">
                            Seu novo consultor financeiro não é apenas uma planilha. É uma inteligência que aprende com seus hábitos para proteger seu futuro.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 bg-card/80 p-4 rounded-2xl border border-border/50 shadow-sm">
                                <div className="h-8 w-8 bg-success/10 text-success rounded-lg flex items-center justify-center mb-3">
                                    <Trophy className="h-4 w-4" />
                                </div>
                                <h3 className="font-bold text-sm mb-1">Passo 1: Ativação</h3>
                                <p className="text-[11px] text-muted-foreground leading-snug">Registre sua primeira renda ou gasto para começar o monitoramento.</p>
                            </div>
                            <div className="flex-1 bg-card/80 p-4 rounded-2xl border border-border/50 shadow-sm">
                                <div className="h-8 w-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-3">
                                    <Brain className="h-4 w-4" />
                                </div>
                                <h3 className="font-bold text-sm mb-1">Passo 2: Inteligência</h3>
                                <p className="text-[11px] text-muted-foreground leading-snug">Após 3 registros, nossa IA começará a gerar insights personalizados.</p>
                            </div>
                        </div>
                        <div className="mt-8">
                            <Link to="#transaction-form" className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-black px-6 py-3 rounded-xl shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all">
                                Criar minha primeira transação &rarr;
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Score Financeiro */}
            <ScoreCard data={score} loading={scoreLoading} />

            {/* Financial Overview Metrics */}
            <SummaryCards
                totalBalance={summary.totalBalance} 
                totalIncome={summary.totalIncome} 
                totalExpenses={summary.totalExpenses} 
                trend={summary.trend}
                trendDirection={summary.trendDirection}
            />
            
            {/* Visual Analytics */}
            <FinanceCharts />
            
            {/* Transactions Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <TransactionForm onAdd={handleAddTransaction} onAddInstallments={handleAddInstallments} />
                </div>
                <div className="lg:col-span-2">
                    <TransactionList transactions={transactions} onDelete={handleDeleteTransaction} />
                </div>
            </div>
        </div>
    );
};

export default Index;
