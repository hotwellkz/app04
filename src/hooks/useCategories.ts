import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Building2, Car, Globe, Hammer, Home, Package, User, Wallet } from 'lucide-react';
import { CategoryCardType } from '../types';
import React from 'react';

const iconMap: { [key: string]: React.ElementType } = {
  Car,
  User,
  Building2,
  Wallet,
  Home,
  Hammer,
  Globe,
  Package
};

export const useCategories = () => {
  const [categories, setCategories] = useState<CategoryCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Создаем один запрос для всех категорий
      const q = query(collection(db, 'categories'), orderBy('row'));
      
      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const categoriesData = snapshot.docs.map(doc => {
            const data = doc.data();
            const IconComponent = iconMap[data.icon] || Home;
            
            return {
              id: doc.id,
              title: data.title,
              amount: data.amount,
              icon: React.createElement(IconComponent, { 
                size: 24,
                className: "text-white"
              }),
              iconName: data.icon,
              color: data.color || 'bg-emerald-500',
              row: data.row || 1
            };
          });
          
          setCategories(categoriesData);
          setLoading(false);
          setError(null);
        },
        (error) => {
          console.error('Ошибка при получении категорий:', error);
          setError('Не удалось загрузить данные');
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error('Ошибка в useCategories:', error);
      setError('Произошла непредвиденная ошибка');
      setLoading(false);
    }
  }, []);

  return { categories, loading, error };
};