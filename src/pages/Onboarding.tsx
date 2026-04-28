import { useState } from 'react';
import { Target, ArrowRight, Brain, TrendingUp, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { completeOnboarding } from '../services/userService';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    monthlyIncome: '',
    goalTitle: '',
    targetAmount: '',
    deadline: ''
  });

  const [error, setError] = useState<string | null>(null);

  const nextStep = () => setStep(prev => prev + 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      await completeOnboarding({
        monthlyIncome: Number(formData.monthlyIncome),
        goal: {
          title: formData.goalTitle,
          targetAmount: Number(formData.targetAmount),
          deadline: new Date(formData.deadline).toISOString()
        }
      });
      await refreshUser();
    } catch (err: any) {
      console.error("Erro ao completar onboarding:", err);
      setError(err.response?.data?.error || "Erro ao conectar com o servidor. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
      <div className="max-w-xl w-full">
        {/* Progress Bar */}
        <div className="flex gap-2 mb-12">
            {[1, 2, 3].map((s) => (
                <div 
                    key={s} 
                    className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-primary' : 'bg-muted'}`} 
                />
            ))}
        </div>

        {step === 1 && (
            <div className="animate-fade-up">
                <div className="p-4 rounded-2xl bg-primary/10 text-primary w-max mb-6">
                    <Sparkles className="w-8 h-8" />
                </div>
                <h1 className="text-4xl font-black tracking-tight mb-4 leading-tight">
                    Sua vida financeira, <br />
                    <span className="text-primary italic">sob controle inteligente.</span>
                </h1>
                <p className="text-muted-foreground text-lg mb-10 leading-relaxed">
                    O FinMind analisa seus hábitos, projeta seu futuro e te orienta todos os dias para você nunca mais fechar o mês no vermelho.
                </p>
                <button 
                    onClick={nextStep}
                    className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-xl shadow-primary/20"
                >
                    Começar Jornada <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        )}

        {step === 2 && (
            <div className="animate-fade-up">
                <h2 className="text-2xl font-bold mb-8">Como vamos transformar suas finanças:</h2>
                <div className="space-y-6 mb-10">
                    <div className="flex gap-4 p-6 glass-card rounded-2xl border-l-4 border-l-primary">
                        <div className="p-3 rounded-xl bg-primary/10 text-primary h-max">
                            <Brain className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold mb-1">IA Coach Ativo</h3>
                            <p className="text-sm text-muted-foreground">Você recebe recomendações diárias baseadas no seu comportamento real.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 p-6 glass-card rounded-2xl border-l-4 border-l-success">
                        <div className="p-3 rounded-xl bg-success/10 text-success h-max">
                            <Target className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold mb-1">Planejamento Visual</h3>
                            <p className="text-sm text-muted-foreground">Defina metas como viagens, casa ou carro e veja o progresso em tempo real.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 p-6 glass-card rounded-2xl border-l-4 border-l-orange-500">
                        <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500 h-max">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold mb-1">Consistência Premiada</h3>
                            <p className="text-sm text-muted-foreground">Ganhe XP e evolua de nível ao manter o controle diário das suas finanças.</p>
                        </div>
                    </div>
                </div>
                <button 
                    onClick={nextStep}
                    className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-xl shadow-primary/20"
                >
                    Entendi, vamos lá! <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        )}

        {step === 3 && (
            <div className="animate-fade-up">
                <h2 className="text-2xl font-bold mb-2">Configure seu primeiro ciclo</h2>
                <p className="text-muted-foreground mb-8">Precisamos desses dados para calibrar o seu Motor Financeiro.</p>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold mb-2">Qual sua renda mensal média?</label>
                        <input 
                            required
                            type="number" 
                            placeholder="R$ 5.000"
                            className="w-full p-4 rounded-xl bg-card border border-border focus:border-primary outline-none transition-all font-medium"
                            value={formData.monthlyIncome}
                            onChange={e => setFormData({...formData, monthlyIncome: e.target.value})}
                        />
                    </div>

                    <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10">
                        <label className="block text-sm font-bold mb-4 flex items-center gap-2">
                            <Target className="w-4 h-4 text-primary" /> Seu Grande Objetivo Atual
                        </label>
                        <div className="space-y-4">
                            <input 
                                required
                                type="text" 
                                placeholder="Ex: Viagem para o Japão"
                                className="w-full p-4 rounded-xl bg-background border border-border focus:border-primary outline-none transition-all font-medium"
                                value={formData.goalTitle}
                                onChange={e => setFormData({...formData, goalTitle: e.target.value})}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <input 
                                    required
                                    type="number" 
                                    placeholder="Valor Meta (R$)"
                                    className="w-full p-4 rounded-xl bg-background border border-border focus:border-primary outline-none transition-all font-medium"
                                    value={formData.targetAmount}
                                    onChange={e => setFormData({...formData, targetAmount: e.target.value})}
                                />
                                <input 
                                    required
                                    type="date" 
                                    className="w-full p-4 rounded-xl bg-background border border-border focus:border-primary outline-none transition-all font-medium"
                                    value={formData.deadline}
                                    onChange={e => setFormData({...formData, deadline: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <p className="text-destructive text-sm font-bold bg-destructive/10 p-3 rounded-xl animate-shake">
                            {error}
                        </p>
                    )}

                    <button 
                        disabled={loading}
                        type="submit"
                        className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
                    >
                        {loading ? 'Configurando...' : 'Finalizar Setup'} <CheckCircle2 className="w-5 h-5" />
                    </button>
                    <p className="text-[10px] text-center text-muted-foreground uppercase font-bold tracking-widest">
                        Seus dados estão protegidos com criptografia bancária.
                    </p>
                </form>
            </div>
        )}
      </div>
    </div>
  );
}
