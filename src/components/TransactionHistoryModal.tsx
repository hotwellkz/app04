import React, { useEffect, useState, useCallback } from 'react';
import { ArrowLeft, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { CategoryCardType } from '../types';

interface Transaction {
  id: string;
  fromUser: string;
  toUser: string;
  amount: number;
  description: string;
  date: any;
  type: 'income' | 'expense';
}

interface TransactionHistoryModalProps {
  category: CategoryCardType;
  isOpen: boolean;
  onClose: () => void;
}

export const TransactionHistoryModal: React.FC<TransactionHistoryModalProps> = ({
  category,
  isOpen,
  onClose
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Создаем запрос с ограничением в 100 транзакций
      const q = query(
        collection(db, 'transactions'),
        where('categoryId', '==', category.id),
        orderBy('date', 'desc'),
        limit(100)
      );

      const snapshot = await getDocs(q);
      const transactionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];

      setTransactions(transactionsData);
    } catch (error) {
      console.error('Ошибка при загрузке транзакций:', error);
      setError('Не удалось загрузить историю транзакций. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  }, [category.id]);

  useEffect(() => {
    if (isOpen) {
      fetchTransactions();
    }
  }, [isOpen, fetchTransactions]);

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('ru-RU').format(Math.abs(amount)) + ' ₸';
  };

  const formatDate = (date: any): string => {
    if (!date) return '';
    return new Date(date.seconds * 1000).toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-10 z-50">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-xl mx-4" style={{ maxHeight: '90vh' }}>
        <div className="sticky top-0 bg-white rounded-t-lg border-b border-gray-200 z-10">
          <div className="flex items-center p-4">
            <button
              onClick={onClose}
              className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-500" />
            </button>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{category.title}</h2>
              <p className={`text-sm mt-1 ${
                category.amount.includes('-') ? 'text-red-500' : 'text-emerald-500'
              }`}>
                Текущий баланс: {category.amount}
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-auto" style={{ height: 'calc(100vh - 200px)' }}>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
          ) : error ? (
            <div className="p-4 mx-4 my-8 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
              <button
                onClick={fetchTransactions}
                className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
              >
                Попробовать снова
              </button>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              История операций пуста
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-3">
                      {transaction.type === 'income' ? (
                        <ArrowUpRight className="w-5 h-5 text-emerald-500 mt-1" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5 text-red-500 mt-1" />
                      )}
                      <div>
                        <div className="font-medium">{transaction.fromUser}</div>
                        <div className="text-sm text-gray-500">{transaction.toUser}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {formatDate(transaction.date)}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className={`font-medium ${
                        transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'} {formatAmount(transaction.amount)}
                      </div>
                      {transaction.description && (
                        <div className="text-sm text-gray-500 mt-1">
                          {transaction.description}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};