import { useState, useEffect } from 'react';
import { getScore, type FinancialScore } from '../services/scoreService';

// Busca o score financeiro. Re-busca quando `refreshKey` muda (ex.: após
// criar/excluir transações no dashboard) para refletir o novo cálculo.
export const useScore = (refreshKey?: unknown) => {
    const [score, setScore] = useState<FinancialScore | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        const token = localStorage.getItem('token');
        if (!token) { setLoading(false); return; }
        (async () => {
            try {
                setLoading(true);
                const data = await getScore();
                if (active) setScore(data);
            } catch (e) {
                console.error('Erro ao buscar score financeiro:', e);
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => { active = false; };
    }, [refreshKey]);

    return { score, loading };
};
