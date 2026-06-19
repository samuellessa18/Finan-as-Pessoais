import { Home, Target, Brain, Bell, LogOut, ShieldCheck, Wallet, BarChart3, Landmark } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { ThemeToggle } from './ThemeToggle';

export function Sidebar() {
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { unreadCount } = useNotifications();

  const links = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Planejamentos', path: '/goals', icon: Target },
    { name: 'Orçamento', path: '/orcamento', icon: Wallet },
    { name: 'Contas', path: '/contas', icon: Landmark },
    { name: 'Insights', path: '/painel', icon: BarChart3 },
    { name: 'IA Financeira', path: '/insights', icon: Brain },
    { name: 'Notificações', path: '/notifications', icon: Bell },
    // [ADMIN] Visível apenas para super_admin (RBAC por role).
    ...(user?.role === 'super_admin'
      ? [{ name: 'Administração', path: '/admin', icon: ShieldCheck }]
      : []),
  ];

  return (
    <div className="w-64 h-screen border-r border-border/40 bg-card/40 backdrop-blur-xl flex flex-col justify-between">
      <div>
        {/* Branding */}
        <div className="p-6 flex items-center gap-3">
          <img src="/logo.png" alt="FinMind Logo" className="h-8 w-8 object-contain" />
          <h1 className="text-xl font-bold tracking-tight">FinMind</h1>
        </div>

        {/* Navigation */}
        <nav className="px-4 space-y-1.5 mt-4">
          {links.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                  isActive 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                <div className="relative">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground/70'}`} />
                    {item.name === 'Notificações' && unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full border border-card"></span>
                    )}
                </div>
                <span>{item.name}</span>
                
                {item.name === 'Notificações' && unreadCount > 0 && (
                    <span className="ml-auto bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {unreadCount}
                    </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Area */}
      <div className="p-4 border-t border-border/40">
        <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
                <ThemeToggle />
            </div>
            <button 
                onClick={signOut}
                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                title="Sair"
            >
                <LogOut className="w-5 h-5" />
            </button>
        </div>
        
        <div className="flex items-center gap-3 px-2">
            <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-xs font-bold overflow-hidden border border-border">
                {user?.user_metadata?.avatar_url || user?.user_metadata?.picture ? (
                    <img src={user.user_metadata.avatar_url || user.user_metadata.picture} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                    user?.user_metadata?.full_name?.charAt(0) || 'U'
                )}
            </div>
            <div className="flex-1 truncate">
                <p className="text-sm font-medium leading-none truncate mb-1 text-foreground">
                    {user?.user_metadata?.full_name || 'Usuário'}
                </p>
                <p className="text-[10px] text-muted-foreground truncate uppercase tracking-wider">Plan SaaS</p>
            </div>
        </div>
      </div>
    </div>
  );
}
