import { api } from './api';

export const getUserProfile = async () => {
    const res = await api.get('/users/profile');
    return res.data;
};

export const performCheckIn = async () => {
    const res = await api.post('/checkin');
    return res.data;
};

export const getEmotionalAnalytics = async () => {
    const res = await api.get('/analytics/emotional');
    return res.data;
};

export const getInsights = async () => {
    const res = await api.get('/insights');
    return res.data;
};

export const generateInsight = async () => {
    const res = await api.post('/insights/generate');
    return res.data;
};

export const trackBehaviorEvent = async (type: string, category?: string, data?: any) => {
    const res = await api.post('/analytics/track', { type, category, data });
    return res.data;
};

export const completeOnboarding = async (data: { monthlyIncome: number; goal: { title: string; targetAmount: number; deadline: string } }) => {
    const res = await api.post('/onboarding', data);
    return res.data;
};

export const getNotifications = async () => {
    const res = await api.get('/notifications');
    return res.data;
};

export const markNotificationAsRead = async (id: string | number) => {
    const res = await api.put(`/notifications/${id}/read`);
    return res.data;
};
