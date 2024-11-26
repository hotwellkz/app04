import { collection, doc, runTransaction, serverTimestamp, addDoc } from 'firebase/firestore';
import { db } from './config';
import { CategoryCardType } from '../../types';

// Вспомогательная функция для парсинга суммы из строки
const parseAmount = (amountStr: string): number => {
  return parseFloat(amountStr.replace(/[^\d.-]/g, ''));
};

// Вспомогательная функция для форматирования суммы
const formatAmount = (amount: number): string => {
  return `${amount} ₸`;
};

export const transferFunds = async (
  sourceCategory: CategoryCardType,
  targetCategory: CategoryCardType,
  amount: number,
  description: string
): Promise<void> => {
  if (!amount || amount <= 0) {
    throw new Error('Сумма перевода должна быть больше нуля');
  }

  if (!description.trim()) {
    throw new Error('Необходимо указать комментарий к переводу');
  }

  try {
    await runTransaction(db, async (transaction) => {
      // Получаем актуальные данные категорий
      const sourceRef = doc(db, 'categories', sourceCategory.id);
      const targetRef = doc(db, 'categories', targetCategory.id);
      
      const sourceDoc = await transaction.get(sourceRef);
      const targetDoc = await transaction.get(targetRef);

      if (!sourceDoc.exists()) {
        throw new Error('Категория отправителя не найдена');
      }

      if (!targetDoc.exists()) {
        throw new Error('Категория получателя не найдена');
      }

      // Получаем текущие балансы
      const sourceBalance = parseAmount(sourceDoc.data().amount);
      const targetBalance = parseAmount(targetDoc.data().amount);

      const timestamp = serverTimestamp();

      // Создаем транзакцию расхода
      const withdrawalRef = doc(collection(db, 'transactions'));
      transaction.set(withdrawalRef, {
        categoryId: sourceCategory.id,
        fromUser: sourceCategory.title,
        toUser: targetCategory.title,
        amount: -amount,
        description,
        type: 'expense',
        date: timestamp
      });

      // Создаем транзакцию дохода
      const depositRef = doc(collection(db, 'transactions'));
      transaction.set(depositRef, {
        categoryId: targetCategory.id,
        fromUser: sourceCategory.title,
        toUser: targetCategory.title,
        amount: amount,
        description,
        type: 'income',
        date: timestamp
      });

      // Обновляем балансы
      const newSourceBalance = sourceBalance - amount;
      const newTargetBalance = targetBalance + amount;

      transaction.update(sourceRef, {
        amount: formatAmount(newSourceBalance),
        updatedAt: timestamp
      });

      transaction.update(targetRef, {
        amount: formatAmount(newTargetBalance),
        updatedAt: timestamp
      });
    });
  } catch (error) {
    console.error('Ошибка при выполнении транзакции:', error);
    throw error;
  }
};