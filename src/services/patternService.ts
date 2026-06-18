import { api } from './api';

export type PatternSeverity = 'high' | 'medium' | 'low';

// Espelha o contrato do backend GET /api/v1/patterns (FASE 3.2):
// alertas de PADRÃO (source='PATTERN'), últimos `days` dias, detectedAt DESC.
export interface PatternItem {
    category: string;
    severity: PatternSeverity;
    percentage: number;
    detectedAt: string;
    message: string;
}

export const listPatterns = async (days?: number): Promise<PatternItem[]> => {
    const res = await api.get('/patterns', { params: typeof days === 'number' ? { days } : undefined });
    return res.data;
};
