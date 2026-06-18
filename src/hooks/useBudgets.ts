import { useState, useEffect, useCallback } from 'react';
import { listBudgets, type BudgetConsumption } from '../services/budgetService';

export const useBudgets = () => {
    const [budgets, setBudgets] = useState<BudgetConsumption[]>([]);
    const [loading, setLoading] = useState(true);

    const reload = useCallback(async () => {
        try {
            setLoading(true);
            setBudgets(await listBudgets());
        } catch (e) {
            console.error('Erro ao carregar orçamentos:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { reload(); }, [reload]);

    return { budgets, loading, reload };
};
