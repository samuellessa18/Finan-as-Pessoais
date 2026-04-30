import { useState, useEffect } from 'react';
import { api } from '@/services/api';

export function useGrowthActions() {
    const [actions, setActions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchActions() {
            try {
                const res = await api.get('/analytics/growth-actions');
                setActions(res.data.actions || []);
            } catch (error) {
                console.error("Erro ao buscar growth actions:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchActions();
    }, []);

    const markAsCompleted = async (actionId: string) => {
        try {
            await api.put(`/analytics/growth-actions/${actionId}`, { status: 'completed' });
            setActions(prev => prev.filter(a => a.id !== actionId));
        } catch (error) {
            console.error("Erro ao marcar action como concluída:", error);
        }
    };

    return { actions, loading, markAsCompleted };
}
