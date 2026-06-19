import { api } from './api';

// [FASE 4.5] Narração financeira — consome POST /api/v1/insights/narrate (FASE 4.4).
// Bearer é injetado pelo interceptor de request do `api`. Provider atual: deterministic.
export interface FinancialNarration {
    title: string;
    summary: string;
    recommendations: string[];
    generatedBy: string;
    generatedAt: string;
}

export const narrate = async (): Promise<FinancialNarration> => {
    const res = await api.post('/insights/narrate');
    return res.data;
};
