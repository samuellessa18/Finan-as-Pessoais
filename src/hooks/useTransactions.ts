import { useState, useEffect } from 'react';
import { api } from '../services/api';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  // Metadados de compra parcelada (null/ausentes em transações comuns)
  installmentGroupId?: string | null;
  installmentNumber?: number | null;
  installmentCount?: number | null;
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
    const token = localStorage.getItem('token');
    if (token) {
      fetchTransactions();
    } else {
      setLoading(false);
    }
  }, []);

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    try {
      const res = await api.post('/transactions', transaction);
      // O backend retorna o objeto da transação direto (res.json(transaction)),
      // não { transaction }. Antes checava res.data.transaction (sempre undefined),
      // então a lista/summary nunca atualizavam após criar.
      if (res.data?.id) {
        setTransactions((prev) => [res.data, ...prev]);
        await fetchSummary();
        setLastUpdated(Date.now());
      }
    } catch (error) {
      console.error('Erro ao adicionar transação:', error);
      throw error;
    }
  };

  const addInstallments = async (data: {
    description: string;
    category: string;
    totalAmount: number;
    installments: number;
  }) => {
    try {
      const res = await api.post('/transactions/installments', data);
      if (res.data?.success) {
        // N parcelas criadas de uma vez — refetch é mais simples e já
        // atualiza lista + resumo + lastUpdated.
        await fetchTransactions();
      }
    } catch (error) {
      console.error('Erro ao registrar compra parcelada:', error);
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

  return { transactions, addTransaction, addInstallments, deleteTransaction, summary, loading, refreshData: fetchTransactions, lastUpdated };
};
