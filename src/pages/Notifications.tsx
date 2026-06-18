import { Bell, Check, CheckCircle2, TrendingUp, Target, Bot, ChevronDown } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import type { Notification } from '@/contexts/NotificationContext';
import { PatternAlertsSection } from '@/components/PatternAlertsSection';

export default function Notifications() {
  const { notifications, markAsRead, markAllAsRead, loading, unreadCount } = useNotifications();

  // Função para agrupar as notificações por data (Hoje, Ontem, ou Data Específica)
  const groupByDay = (notes: Notification[]) => {
    return notes.reduce((acc: Record<string, Notification[]>, n) => {
      const date = new Date(n.createdAt);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      
      let key = 'Anteriores';
      if (date.toDateString() === today.toDateString()) {
        key = 'Hoje';
      } else if (date.toDateString() === yesterday.toDateString()) {
        key = 'Ontem';
      } else {
        key = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
      }

      if (!acc[key]) acc[key] = [];
      acc[key].push(n);
      return acc;
    }, {});
  };

  const getPriorityStyles = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
        case 'high': return 'border-l-destructive bg-destructive/5 text-destructive';
        case 'medium': return 'border-l-primary bg-primary/5 text-primary';
        case 'low': return 'border-l-muted-foreground bg-muted/20 text-muted-foreground';
    }
  };

  const getTypeIcon = (type: Notification['type'], priority: string) => {
    switch (type) {
        case 'morning_summary': return <TrendingUp className={`w-5 h-5 ${priority === 'high' ? 'text-destructive' : 'text-primary'}`} />;
        case 'daily_limit': return <CheckCircle2 className="w-5 h-5 text-primary" />;
        case 'goal_reminder': return <Target className="w-5 h-5 text-destructive" />;
        case 'ai_insight': return <Bot className="w-5 h-5 text-primary" />;
    }
  };

  const groupedNotifications = groupByDay(notifications);

  if (loading) {
    return (
        <div className="max-w-4xl mx-auto px-6 py-8 animate-fade-in flex justify-center items-center h-[50vh]">
            <img src="/logo.png" alt="FinMind Logo" className="h-10 w-10 animate-bounce object-contain" />
        </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10 text-primary relative">
            <Bell className="h-6 w-6" />
            {unreadCount > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-destructive rounded-full" />}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Suas Notificações</h1>
            <p className="text-muted-foreground text-sm">Painel de controle autônomo com inteligência financeira.</p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className="text-sm font-semibold tracking-wide text-primary hover:text-primary/80 transition-colors uppercase flex items-center justify-center md:justify-start gap-1"
          >
             <Check className="h-4 w-4" /> Marcar todas como Lidas
          </button>
        )}
      </div>

      {/* [FASE 3.4] Alertas de PADRÃO (GET /api/v1/patterns) — fonte separada das notificações */}
      <PatternAlertsSection />

      <div className="space-y-10">
          {Object.entries(groupedNotifications).map(([dayKey, dayNotes]) => (
              <div key={dayKey}>
                  <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-2">
                    {dayKey}
                  </h3>
                  <div className="space-y-3">
                      {dayNotes.map((note) => (
                          <div 
                            key={note.id} 
                            onClick={() => !note.read && markAsRead(note.id)}
                            className={`glass-card rounded-2xl p-5 border-l-4 transition-all duration-300 ${getPriorityStyles(note.priority)} ${
                                note.read ? 'opacity-60 saturate-50' : 'opacity-100 hover:scale-[1.01] cursor-pointer'
                            }`}
                          >
                              <div className="flex gap-4 items-start">
                                  <div className="mt-1">
                                    {getTypeIcon(note.type, note.priority)}
                                  </div>
                                  <div className="flex-1">
                                      {note.message.includes('\n') ? (
                                          <div className="space-y-1.5 bg-background/50 p-3 rounded-lg border border-border/40">
                                              {note.message.split('\n').map((line, i) => {
                                                  // Destaca as palavras-chave da IA (1. Problema, 2. Ação, etc)
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
                                              <button 
                                                onClick={(e) => { e.stopPropagation(); /* logic to expand modal if needed */ }}
                                                className="text-xs font-bold text-primary opacity-80 mt-2 flex items-center gap-1 hover:underline"
                                              >
                                                  Ver mais detalhes sobre esse comportamento <ChevronDown className="w-3 h-3" />
                                              </button>
                                          </div>
                                      ) : (
                                          <p className="text-sm md:text-base font-medium leading-relaxed text-foreground">
                                              {note.message}
                                          </p>
                                      )}
                                      <div className="text-xs uppercase tracking-wider font-bold mt-2 opacity-70 flex gap-2">
                                        <span>{note.type === 'ai_insight' ? '💡 Dica do Dia' : note.type.replace('_', ' ')}</span>
                                        {!note.read && (
                                            <span className="text-destructive font-extrabold flex items-center gap-1">
                                                <span className="h-1.5 w-1.5 bg-destructive rounded-full"></span>
                                                Novo
                                            </span>
                                        )}
                                      </div>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          ))}

          {notifications.length === 0 && (
              <div className="text-center p-12 glass-card rounded-2xl border-dashed">
                  <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground font-medium">Você não possui novas notificações da IA hoje.</p>
              </div>
          )}
      </div>
    </div>
  );
}
