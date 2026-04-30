import { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
}

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState({
    totalBalance: 0,
    totalIncome: 0,
    totalExpenses: 0,
    trend: null as number | null,
    trendDirection: null as string | null
  });
  const [loading, setLoading] = useState(true);

  const [lastUpdated, setLastUpdated] = useState(Date.now());

  const fetchSummary = async () => {
    try {
      const res = await api.get('/finance/summary');
      setSummary(res.data);
    } catch (error) {
      console.error('Erro ao buscar resumo financeiro:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/transactions');
      setTransactions(res.data);
      await fetchSummary();
      setLastUpdated(Date.now());
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    try {
      const res = await api.post('/transactions', transaction);
      if (res.data.transaction) {
        setTransactions((prev) => [res.data.transaction, ...prev]);
        await fetchSummary();
        setLastUpdated(Date.now());
      }
    } catch (error) {
      console.error('Erro ao adicionar transação:', error);
      throw error;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await api.delete(`/transactions/${id}`);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      await fetchSummary();
      setLastUpdated(Date.now());
    } catch (error) {
      console.error('Erro ao excluir transação:', error);
    }
  };

  return { transactions, addTransaction, deleteTransaction, summary, loading, refreshData: fetchTransactions, lastUpdated };
};
