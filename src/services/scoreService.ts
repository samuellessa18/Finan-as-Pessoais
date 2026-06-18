import { api } from './api';

export type ScoreBand = 'Crítico' | 'Atenção' | 'Bom' | 'Excelente' | 'Elite';

export interface ScoreBreakdown {
    economia: number;
    controle: number;
    metas: number | null;
    consistencia: number;
    weightsApplied: Record<string, number>;
    window: string;
}

export interface FinancialScore {
    score: number;
    band: ScoreBand;
    breakdown: ScoreBreakdown;
    previousScore: number | null;
    delta: number | null;
    message: string;
}

export const getScore = async (): Promise<FinancialScore> => {
    const res = await api.get('/finance/score');
    return res.data;
};
