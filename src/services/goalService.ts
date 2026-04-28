import { api } from './api';

export const getGoals = async () => {
    const res = await api.get('/goals');
    return res.data;
};

export const createGoal = async (data: any) => {
    const res = await api.post('/goals', data);
    return res.data;
};

export const updateGoal = async (id: string | number, data: any) => {
    const res = await api.put(`/goals/${id}`, data);
    return res.data;
};
