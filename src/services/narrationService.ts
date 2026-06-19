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

// [FASE 4.6B] Timeout explícito da narração (configurável via VITE_NARRATE_TIMEOUT_MS;
// default 20s). O `api` global não define timeout — este é por requisição, sem afetar
// os demais serviços. Em estouro, o axios rejeita com code 'ECONNABORTED'.
const NARRATE_TIMEOUT_MS = Number(import.meta.env.VITE_NARRATE_TIMEOUT_MS) || 20000;

export const narrate = async (): Promise<FinancialNarration> => {
    // [FASE 4.6A] `/insights/narrate` é POST NÃO-idempotente (persiste Insight +
    // consome quota + futuro custo LLM). Desabilita o retry SOMENTE nesta requisição
    // (override por-request do axios-retry) — preserva o comportamento global dos GETs
    // e dos demais endpoints. Evita 2ª persistência em erro de rede/5xx.
    const res = await api.post('/insights/narrate', undefined, {
        timeout: NARRATE_TIMEOUT_MS,
        'axios-retry': { retries: 0 },
    });
    return res.data;
};
