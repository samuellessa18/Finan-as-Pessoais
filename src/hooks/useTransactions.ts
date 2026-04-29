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
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/transactions');
      setTransactions(res.data);
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const summary = useMemo(() => {
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
    const totalExpenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);

    return {
      totalBalance: totalIncome - totalExpenses,
      totalIncome,
      totalExpenses,
    };
  }, [transactions]);

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    try {
      const res = await api.post('/transactions', transaction);
      // O backend retorna { transaction, impactMessage }
      if (res.data.transaction) {
        setTransactions((prev) => [res.data.transaction, ...prev]);
        window.dispatchEvent(new Event('finance-updated'));
      }
    } catch (error) {
       // Se houver warning (conflict 409), ele pode retornar o aviso. 
       // Para simplificar agora, apenas logamos.
      console.error('Erro ao adicionar transação:', error);
      throw error; // Repassa para o formulário tratar se necessário (ex: confirmar warning)
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await api.delete(`/transactions/${id}`);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      window.dispatchEvent(new Event('finance-updated'));
    } catch (error) {
      console.error('Erro ao excluir transação:', error);
    }
  };

  return { transactions, addTransaction, deleteTransaction, summary, loading };
};
