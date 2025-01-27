import React, { useState } from 'react';
import { categories } from '../models/expense';

interface AddBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: { category: string; limit: number }) => void;
  existingCategories: string[];
}

export function AddBudgetModal({ isOpen, onClose, onAdd, existingCategories }: AddBudgetModalProps) {
  const [category, setCategory] = useState('');
  const [limit, setLimit] = useState('');

  if (!isOpen) return null;

  const availableCategories = categories.filter(
    cat => !existingCategories.includes(cat)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      category,
      limit: parseFloat(limit)
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Add New Budget</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            >
              <option value="">Select category</option>
              {availableCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Budget Limit</label>
            <input
              type="number"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Add Budget
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}