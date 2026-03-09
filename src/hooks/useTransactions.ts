import { useState, useEffect } from 'react';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({
    totalBalance: 0,
    totalIncome: 0,
    totalExpenses: 0
  });

  const addTransaction = (transaction: any) => {
    console.log('Adding transaction:', transaction);
  };

  const deleteTransaction = (id: string) => {
    console.log('Deleting transaction:', id);
  };

  return { transactions, addTransaction, deleteTransaction, summary, loading };
};
