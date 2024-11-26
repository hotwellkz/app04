import React from 'react';
import { CategoryCardType } from '../../types';
import { DroppableCategory } from './DroppableCategory';
import { AddCategoryButton } from '../AddCategoryButton';

interface CategoryRowProps {
  title: string;
  categories: CategoryCardType[];
  onHistoryClick: (category: CategoryCardType) => void;
  onAddCategory?: () => void;
  rowNumber: number;
}

export const CategoryRow: React.FC<CategoryRowProps> = ({
  title,
  categories,
  onHistoryClick,
  onAddCategory,
  rowNumber
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-3">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-gray-900">{title}</h2>
        <span className="text-xs text-gray-500">
          {categories.length} {categories.length === 1 ? 'элемент' : 'элементов'}
        </span>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
        {categories.map((category) => (
          <div key={category.id}>
            <DroppableCategory
              category={category}
              onHistoryClick={() => onHistoryClick(category)}
            />
          </div>
        ))}
        
        {onAddCategory && (
          <div>
            <AddCategoryButton onClick={onAddCategory} />
          </div>
        )}
      </div>
    </div>
  );
};