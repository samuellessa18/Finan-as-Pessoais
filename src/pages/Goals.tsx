import { Target, Plus, X, Edit2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getGoals, createGoal, updateGoal } from '../services/goalService';
import { useGamification } from '@/contexts/GamificationContext';

export interface Goal {
  id: string | number;
  userId?: string;
  title: string;
  type: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
}

const goalTypes = [
  { label: "Viagem", value: "travel", icon: "✈️" },
  { label: "Casa/Apartamento", value: "home", icon: "🏠" },
  { label: "Carro", value: "car", icon: "🚗" },
  { label: "Moto", value: "motorcycle", icon: "🏍️" },
  { label: "Reserva Emergência", value: "emergency", icon: "🛡️" }
];

function GoalModal({ goal, onSave, onClose }: { goal: Goal | null, onSave: (data: Partial<Goal>) => void, onClose: () => void }) {
  const [title, setTitle] = useState(goal?.title || '');
  const [type, setType] = useState(goal?.type || 'travel');
  const [target, setTarget] = useState(goal?.targetAmount?.toString() || '');
  const [current, setCurrent] = useState(goal?.currentAmount?.toString() || '0');
  const [deadline, setDeadline] = useState(goal?.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : '');

  const targetNum = Number(target) || 0;
  const currentNum = Number(current) || 0;
  
  // Motor financeiro
  let effort = 0;
  let months = 0;

  if (targetNum > currentNum && deadline) {
    const end = new Date(deadline);
    const now = new Date();
    months = (end.getFullYear() - now.getFullYear()) * 12 + (end.getMonth() - now.getMonth());
    if (months <= 0) months = 1;
    effort = (targetNum - currentNum) / months;
  }

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      type,
      targetAmount: targetNum,
      currentAmount: currentNum,
      deadline: new Date(deadline).toISOString()
    });
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="glass-card w-full max-w-md rounded-2xl p-6 relative">
        <button onClick={onClose} className="absolute right-4 top-4 p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors">
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-bold tracking-tight mb-6">
          {goal ? 'Editar meta' : 'Nova meta'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Título da Meta</label>
            <input
              required
              placeholder="Ex: Viagem para Europa"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border/50 bg-background/50 focus:bg-background focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Categoria</label>
            <select 
              value={type} 
              onChange={e => setType(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border/50 bg-background/50 focus:bg-background focus:ring-1 focus:ring-primary outline-none transition-all text-sm appearance-none"
            >
              {goalTypes.map(t => (
                <option key={t.value} value={t.value}>
                  {t.icon} {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Já Poupado (R$)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={current}
                onChange={e => setCurrent(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border/50 bg-background/50 focus:bg-background focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Alvo Global (R$)</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                placeholder="10000.00"
                value={target}
                onChange={e => setTarget(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border/50 bg-background/50 focus:bg-background focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Prazo Ideal</label>
            <input
              type="date"
              required
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border/50 bg-background/50 focus:bg-background focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
            />
          </div>

          {/* Motor Inteligente */}
          {effort > 0 && months > 0 && (
            <div className="mt-4 p-4 rounded-xl border border-primary/20 bg-primary/5 flex flex-col gap-1">
              <span className="text-xs uppercase font-bold tracking-wider text-primary">Projeção Inteligente</span>
              <p className="text-sm text-muted-foreground">
                Para atingir essa meta em <strong className="text-foreground">{months} meses</strong>, você precisará guardar <strong className="text-foreground">{formatCurrency(effort)}/mês</strong>.
              </p>
              <div className="mt-2 text-xs border-t border-primary/10 pt-2 text-muted-foreground flex items-start gap-1.5">
                  <span className="text-primary">💡</span>
                  <p className="leading-snug">Se agir com constância e aportar <strong>{formatCurrency(effort * 1.5)}/mês</strong>, o prazo é aniquilado e cai para apenas <strong>{Math.ceil((targetNum - currentNum) / (effort * 1.5))} meses</strong>.</p>
              </div>
            </div>
          )}

          <button type="submit" className="w-full mt-6 bg-primary text-primary-foreground font-semibold py-3 rounded-xl hover:bg-primary/90 transition-all flex justify-center items-center gap-2">
            Salvar Planejamento
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const { refreshGamification } = useGamification();

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const data = await getGoals();
      setGoals(data);
    } catch (error) {
      console.error("Erro ao buscar metas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const handleOpenEdit = (goal: Goal | null) => {
    setEditingGoal(goal);
    setIsModalOpen(true);
  };

  const handleSave = async (data: Partial<Goal>) => {
    try {
      if (editingGoal) {
        const updated = await updateGoal(editingGoal.id, data);
        setGoals(prev => prev.map(g => g.id === editingGoal.id ? updated : g));
      } else {
        const created = await createGoal(data);
        setGoals(prev => [...prev, created]);
      }
      setIsModalOpen(false);
      await refreshGamification();
    } catch (error) {
      console.error("Erro ao salvar objetivo:", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 animate-fade-in relative min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Planejamentos</h1>
            <p className="text-muted-foreground text-sm">Acompanhe suas metas de longo prazo com precisão visual.</p>
          </div>
        </div>
        <button 
          onClick={() => handleOpenEdit(null)}
          className="bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-medium tracking-tight flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" /> Nova Meta
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="glass-card p-6 rounded-2xl h-80 animate-pulse bg-muted/20" />
          ))}
        </div>
      ) : goals.length === 0 ? (
        <div className="glass-card p-12 rounded-2xl flex flex-col items-center justify-center text-center">
            <div className="p-4 rounded-full bg-muted mb-4">
                <Target className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold">Nenhuma meta ainda</h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto mt-1 mb-6">
                Defina seu primeiro objetivo financeiro para que a IA possa te ajudar a chegar lá mais rápido.
            </p>
            <button 
                onClick={() => handleOpenEdit(null)}
                className="bg-primary text-primary-foreground px-6 py-2 rounded-xl font-bold text-sm"
            >
                Criar Minha Primeira Meta
            </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
          const isComplete = percentage === 100;
          
          const iconObj = goalTypes.find(t => t.value === goal.type);
          const icon = iconObj ? iconObj.icon : '📌';

          // Motor financeiro local
          const end = new Date(goal.deadline);
          const now = new Date();
          let monthsLeft = (end.getFullYear() - now.getFullYear()) * 12 + (end.getMonth() - now.getMonth());
          const displayDate = end.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });

          // Insight Calculators
          let monthly: number | null = null;
          let insight = { msg: 'Prazo finalizado', type: 'border-destructive text-destructive bg-destructive/10', icon: '🚧' };
          
          if (monthsLeft > 0 && !isComplete) {
              monthly = (goal.targetAmount - goal.currentAmount) / monthsLeft;
              if (monthly > 2500) {
                  insight = { msg: 'Agressiva: exige foco alto', type: 'border-destructive text-destructive bg-destructive/10', icon: '🔴' };
              } else if (monthly > 800) {
                  insight = { msg: 'Viável com consistência', type: 'border-warning text-warning-foreground bg-warning/20', icon: '🟡' }; 
              } else {
                  insight = { msg: 'Você está no caminho certo', type: 'border-success text-success bg-success/10', icon: '🟢' };
              }
          } else if (isComplete) {
              insight = { msg: 'Meta Concluída!', type: 'border-primary text-primary bg-primary/10', icon: '🎉' };
          }

          if (monthsLeft < 0) monthsLeft = 0;

          return (
            <div key={goal.id} className="glass-card p-6 rounded-2xl flex flex-col justify-between group">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
                    {icon} {goal.title}
                  </h2>
                  <button 
                    onClick={() => handleOpenEdit(goal)}
                    className="p-1.5 rounded-lg border border-border/50 text-muted-foreground hover:bg-muted hover:text-foreground opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                    title="Editar Planejamento"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                
                <div className="flex justify-between items-end border-t border-border/50 pt-4 mb-5 mt-2">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Atual / Meta</p>
                    <p className="font-bold tabular-nums">
                      {formatCurrency(goal.currentAmount)}
                      <span className="text-muted-foreground font-medium ml-1">
                        / {formatCurrency(goal.targetAmount)}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="h-3 w-full bg-muted/50 rounded-full overflow-hidden mb-3">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${isComplete ? 'bg-success' : 'bg-primary'}`} 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                
                <div className="flex justify-between items-center mb-6">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">
                        {percentage.toFixed(1)}% Poupado
                    </p>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground border border-border/50 px-2 py-1 rounded">
                        Até {displayDate}
                    </span>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-border/40 bg-muted/10">
                {monthly !== null && !isComplete ? (
                    <p className="text-sm font-bold text-primary mb-2">
                        💡 Guardar {formatCurrency(monthly)}/mês
                    </p>
                ) : null}
                <div className={`text-xs font-semibold px-2.5 py-1.5 rounded-md border inline-flex items-center gap-1.5 ${insight.type}`}>
                    {insight.icon} {insight.msg}
                </div>
              </div>

              <button 
                onClick={() => handleOpenEdit(goal)}
                className="w-full mt-4 bg-muted/30 text-muted-foreground hover:bg-muted font-bold text-xs uppercase tracking-wider py-2.5 rounded-lg border border-border/50 transition-colors"
              >
                Ajustar Plano
              </button>
            </div>
          );
        })}
      </div>
      )}

      {isModalOpen && (
        <GoalModal 
          goal={editingGoal} 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleSave} 
        />
      )}
    </div>
  );
}
