import { createContext, useContext, useState, useEffect } from 'react';
import { getNotifications, markNotificationAsRead } from '../services/userService';
import { useAuth } from './AuthContext';

export interface Notification {
  id: number | string;
  type: 'morning_summary' | 'daily_limit' | 'goal_reminder' | 'ai_insight' | 'ai_coach' | 'achievement' | 'gamification' | 'warning' | 'opportunity';
  message: string;
  title?: string;
  priority: 'high' | 'medium' | 'low';
  read: boolean;
  createdAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: number | string) => void;
  markAllAsRead: () => void;
  loading: boolean;
}

const NotificationContext = createContext<NotificationContextType>({} as NotificationContextType);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotificationsData = async () => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotificationsData();
    
    // Escuta atualizações globais para recarregar notificações (ex: após ações que geram XP/Alertas)
    window.addEventListener('finance-updated', fetchNotificationsData);
    return () => window.removeEventListener('finance-updated', fetchNotificationsData);
  }, [user]);

  const markAsRead = async (id: number | string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error("Erro ao marcar como lida:", error);
    }
  };

  const markAllAsRead = async () => {
    // Optimistic UI for marking all as read
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    // Implement backend endpoint for read-all if needed later
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, loading }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
