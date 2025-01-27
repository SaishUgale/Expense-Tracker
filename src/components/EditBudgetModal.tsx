import React, { useState } from 'react';
import { Budget, currencies } from '../models/expense';

interface EditBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (category: string, data: { limit: number }) => void;
  onDelete: (category: string) => void;
  budget: Budget;
}

export function EditBudgetModal({ isOpen, onClose, onEdit, onDelete, budget }: EditBudgetModalProps) {
  const [limit, setLimit] = useState(budget.limit.toString());

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onEdit(budget.category, {
      limit: parseFloat(limit)
    });
    onClose();
  };

  const getCurrencySymbol = (code: string) => {
    return currencies.find(c => c.code === code)?.symbol || code;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Edit Budget for {budget.category}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Budget Limit</label>
            <div className="mt-1 relative">
              <span className="absolute left-3 top-2">{getCurrencySymbol(budget.currency)}</span>
              <input
                type="number"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                className="block w-full pl-8 rounded-md border border-gray-300 px-3 py-2"
                required
              />
            </div>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => onDelete(budget.category)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Delete
            </button>
            <div className="space-x-2">
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
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}