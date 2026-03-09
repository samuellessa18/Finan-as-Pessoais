import { useTransactions } from '@/hooks/useTransactions';
import { useAuth } from '@/contexts/AuthContext';
import { SummaryCards } from '@/components/SummaryCards';
import { TransactionForm } from '@/components/TransactionForm';
import { TransactionList } from '@/components/TransactionList';
import { FinanceCharts } from '@/components/FinanceCharts';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

const Index = () => {
    const { transactions, addTransaction, deleteTransaction, summary, loading } = useTransactions();
    const { user, signOut } = useAuth();

    const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || '';
    const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || '';

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <span className="text-muted-foreground">Carregando transações...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border/50 bg-card/60 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
                        <span className="text-primary-foreground font-bold text-sm">F$</span>
                    </div>
                    <h1 className="text-xl font-bold tracking-tight flex-1">Finanças Pessoais</h1>
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={avatarUrl} alt={displayName} />
                            <AvatarFallback className="text-xs">{displayName.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground hidden sm:inline">{displayName}</span>
                        <Button variant="ghost" size="icon" onClick={signOut} className="h-8 w-8">
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
                <SummaryCards {...summary} />
                <FinanceCharts transactions={transactions} />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                        <TransactionForm onAdd={addTransaction} />
                    </div>
                    <div className="lg:col-span-2">
                        <TransactionList transactions={transactions} onDelete={deleteTransaction} />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Index;
