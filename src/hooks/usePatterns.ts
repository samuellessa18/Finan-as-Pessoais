import { useState, useEffect, useCallback } from 'react';
import { listPatterns, type PatternItem } from '../services/patternService';

// Consome GET /api/v1/patterns (read-only). `days` opcional (default do backend = 90).
export const usePatterns = (days?: number) => {
    const [patterns, setPatterns] = useState<PatternItem[]>([]);
    const [loading, setLoading] = useState(true);

    const reload = useCallback(async () => {
        try {
            setLoading(true);
            setPatterns(await listPatterns(days));
        } catch (e) {
            console.error('Erro ao carregar padrões:', e);
        } finally {
            setLoading(false);
        }
    }, [days]);

    useEffect(() => { reload(); }, [reload]);

    return { patterns, loading, reload };
};
