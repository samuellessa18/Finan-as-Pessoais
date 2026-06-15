import { api } from './api';

export interface AdminUser {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'admin' | 'super_admin';
    plan: 'free' | 'pro';
    isPremium: boolean;
    onboardingCompleted: boolean;
    provider: string;
    createdAt: string;
}

export const listUsers = async (search?: string): Promise<AdminUser[]> => {
    const res = await api.get('/admin/users', { params: search ? { search } : {} });
    return res.data;
};

export const getUser = async (id: string): Promise<AdminUser> => {
    const res = await api.get(`/admin/users/${id}`);
    return res.data;
};

export const updateUserPlan = async (id: string, plan: 'free' | 'pro'): Promise<AdminUser> => {
    const res = await api.patch(`/admin/users/${id}/plan`, { plan });
    return res.data;
};

export const updateUserPremium = async (id: string, isPremium: boolean): Promise<AdminUser> => {
    const res = await api.patch(`/admin/users/${id}/premium`, { isPremium });
    return res.data;
};

export const updateUserRole = async (id: string, role: AdminUser['role']): Promise<AdminUser> => {
    const res = await api.patch(`/admin/users/${id}/role`, { role });
    return res.data;
};

export const deleteUser = async (id: string): Promise<{ success: boolean }> => {
    const res = await api.delete(`/admin/users/${id}`);
    return res.data;
};
