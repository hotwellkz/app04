import React, { useEffect, useRef } from 'react';
import { History, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { CategoryCardType } from '../../types';

interface CategoryContextMenuProps {
  position: { x: number; y: number };
  category: CategoryCardType;
  onClose: () => void;
  onViewHistory: () => void;
}

export const CategoryContextMenu: React.FC<CategoryContextMenuProps> = ({
  position,
  category,
  onClose,
  onViewHistory
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed bg-white rounded-lg shadow-lg py-1 z-50 min-w-[200px]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <button
        onClick={onViewHistory}
        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
      >
        <History className="w-4 h-4" />
        История операций
      </button>

      <div className="px-4 py-2 border-t border-gray-100">
        <div className="text-xs text-gray-500">Текущий баланс:</div>
        <div className={`text-sm font-medium ${
          category.amount.includes('-') ? 'text-red-500' : 'text-emerald-500'
        }`}>
          {category.amount}
        </div>
      </div>
    </div>
  );
};