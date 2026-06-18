import { api } from './api';

export type BudgetStatus = 'NORMAL' | 'ATENÇÃO' | 'EXCEDIDO' | 'CRÍTICO';

export interface BudgetConsumption {
    id: string;
    category: string;
    monthlyLimit: number;
    spent: number;
    pct: number;
    status: BudgetStatus;
    forecast: {
        avgDaily: number;
        projected: number;
        daysRemaining: number;
        daysToExceed: number | null;
        willExceed: boolean;
    };
    forecastMessage: string;
}

export const listBudgets = async (): Promise<BudgetConsumption[]> => {
    const res = await api.get('/budgets');
    return res.data;
};

export const upsertBudget = async (category: string, monthlyLimit: number) => {
    const res = await api.post('/budgets', { category, monthlyLimit });
    return res.data;
};

export const updateBudget = async (id: string, monthlyLimit: number) => {
    const res = await api.patch(`/budgets/${id}`, { monthlyLimit });
    return res.data;
};

export const deleteBudget = async (id: string) => {
    const res = await api.delete(`/budgets/${id}`);
    return res.data;
};
