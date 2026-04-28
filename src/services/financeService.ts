import { api } from './api';

export const getFinanceChart = async () => {
    const res = await api.get('/finance/chart');
    return res.data;
};

export const getFinanceSummary = async () => {
    const res = await api.get('/finance/summary');
    return res.data;
};
