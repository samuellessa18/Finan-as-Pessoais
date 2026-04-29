import { Brain, Flame, ArrowUpRight, TrendingUp, ShieldCheck, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getInsights, getEmotionalAnalytics, generateInsight } from '../services/userService';

interface Insight {
    id: string | number;
    message: string;
    type: string;
    createdAt: string;
}

export default function Insights() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [behavioral, setBehavioral] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [insightsData, behavioralData] = await Promise.all([
          getInsights(),
          getEmotionalAnalytics()
      ]);
      setInsights(insightsData);
      setBehavioral(behavioralData);
    } catch (error) {
      console.error("Failed to load insights", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleManualGenerate = async () => {
      try {
          setGenerating(true);
          await generateInsight();
          await fetchData();
      } catch (error) {
          console.error("Error generating insight:", error);
      } finally {
          setGenerating(false);
      }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <Brain className="h-6 w-6" />
            </div>
            <div>
            <h1 className="text-2xl font-bold tracking-tight">Consultoria Comportamental</h1>
            <p className="text-muted-foreground text-sm">O sistema pensa, interpreta seus dados e orienta seu futuro.</p>
            </div>
        </div>

        <button 
            onClick={handleManualGenerate}
            disabled={generating}
            className="flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
        >
            <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
            {generating ? 'Consultando IA...' : 'Pedir Nova Análise'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <div className="glass-card p-6 rounded-2xl border border-orange-500/20 bg-gradient-to-br from-card to-orange-500/5 relative overflow-hidden">
            <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <Flame className="w-5 h-5 text-orange-500" />
                <span className="text-sm font-semibold uppercase tracking-wider">Streak Financeiro</span>
            </div>
            <div>
                <h2 className="text-4xl font-black mb-1 text-foreground tracking-tighter">
                    {behavioral?.metrics?.streakDays || 0}
                    <span className="text-lg text-muted-foreground ml-1">dias</span>
                </h2>
                <p className="text-sm font-bold text-orange-500">
                    {behavioral?.emotional?.consistencyMessage || "Aguardando primeiro check-in..."}
                </p>
            </div>
        </div>
        <div className="glass-card p-6 rounded-2xl border border-success/20 bg-gradient-to-br from-card to-success/5 relative overflow-hidden">
            <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <ArrowUpRight className="w-5 h-5 text-success" />
                <span className="text-sm font-semibold uppercase tracking-wider">Controle Preventivo</span>
            </div>
            <div>
                <p className="text-sm leading-relaxed font-medium text-foreground">
                    {behavioral?.emotional?.preventionMessage || "O sistema está aprendendo seus hábitos."}
                </p>
                <div className="flex items-center gap-1.5 mt-3 text-success">
                    <ShieldCheck className="w-4 h-4" />
                    <p className="text-sm font-bold">Monitoramento de segurança ativo.</p>
                </div>
            </div>
        </div>
        <div className="glass-card p-6 rounded-2xl border border-primary/20 bg-gradient-to-br from-card to-primary/5 relative overflow-hidden md:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="text-sm font-semibold uppercase tracking-wider">Engajamento Inteligente</span>
            </div>
            <div>
                <p className="text-sm leading-relaxed font-medium text-foreground">
                    {behavioral?.emotional?.engagementMessage || "Seus padrões surgirão após 3 dias de uso."}
                </p>
                <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                        {behavioral?.metrics?.smartEngagementRate ? `${Math.round(behavioral.metrics.smartEngagementRate * 100)}% engajamento` : 'Analisando engajamento...'}
                    </span>
                </div>
            </div>
        </div>
      </div>

      <h2 className="text-lg font-bold tracking-tight mb-4 flex items-center gap-2">Feed do Consultor</h2>

      {loading ? (
        <div className="space-y-4">
            {[1,2,3].map(i => (
                <div key={i} className="h-24 glass-card rounded-2xl animate-pulse bg-muted/20"></div>
            ))}
        </div>
      ) : insights.length === 0 ? (
        <div className="glass-card p-12 rounded-2xl text-center border-dashed border-2">
            <p className="text-muted-foreground">O Coach ainda está analisando seu perfil. Use o app normalmente.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {insights.map((insight, idx) => {
            const isWarning = insight.type === 'warning';

            return (
              <div 
                key={insight.id || idx} 
                className={`glass-card p-6 rounded-2xl border-l-4 transition-all hover:translate-x-1 ${isWarning ? 'border-l-warning' : 'border-l-primary bg-primary/5'}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`mt-1.5 h-2.5 w-2.5 rounded-full flex-shrink-0 ${isWarning ? 'bg-warning' : 'bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]'}`}></div>
                  <div className="flex-1">
                      {insight.message.includes('\n') ? (
                          <div className="space-y-1.5">
                              {insight.message.split('\n').map((line, i) => {
                                  const parts = line.split(':');
                                  if (parts.length > 1) {
                                      return (
                                        <p key={i} className="text-sm md:text-base leading-relaxed text-foreground">
                                            <strong className="text-primary font-bold">{parts[0]}:</strong> {parts.slice(1).join(':')}
                                        </p>
                                      );
                                  }
                                  return (
                                    <p key={i} className="text-sm md:text-base font-medium leading-relaxed text-foreground">
                                        {line}
                                    </p>
                                  )
                              })}
                          </div>
                      ) : (
                          <div className="flex flex-col gap-1">
                            <p className="text-sm md:text-base font-medium leading-relaxed text-foreground">{insight.message}</p>
                            <span className="text-[10px] text-muted-foreground uppercase font-bold mt-2">
                                {new Date(insight.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                      )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
