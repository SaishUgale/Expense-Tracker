import React, { useState } from 'react';
import { User, categories, currencies, Expense } from '../models/expense';

interface EditExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (id: string, data: {
    amount: number;
    category: string;
    description: string;
    paidBy: string;
    splitBetween: string[];
  }) => void;
  onDelete: (id: string) => void;
  expense: Expense;
  users: User[];
  currency: string;
}

export function EditExpenseModal({ isOpen, onClose, onEdit, onDelete, expense, users, currency }: EditExpenseModalProps) {
  const [amount, setAmount] = useState(expense.amount.toString());
  const [category, setCategory] = useState(expense.category);
  const [description, setDescription] = useState(expense.description);
  const [paidBy, setPaidBy] = useState(expense.paidBy);
  const [splitBetween, setSplitBetween] = useState<string[]>(expense.splitBetween);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onEdit(expense.id, {
      amount: parseFloat(amount),
      category,
      description,
      paidBy,
      splitBetween
    });
    onClose();
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this expense?')) {
      onDelete(expense.id);
      onClose();
    }
  };

  const getCurrencySymbol = (code: string) => {
    return currencies.find(c => c.code === code)?.symbol || code;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Edit Expense</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Amount</label>
            <div className="mt-1 relative">
              <span className="absolute left-3 top-2">{getCurrencySymbol(currency)}</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="block w-full pl-8 rounded-md border border-gray-300 px-3 py-2"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Paid By (Optional)</label>
            <select
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="">Select user</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Split Between</label>
            <div className="mt-1 space-y-2">
              {users.map(user => (
                <label key={user.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={splitBetween.includes(user.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSplitBetween([...splitBetween, user.id]);
                      } else {
                        setSplitBetween(splitBetween.filter(id => id !== user.id));
                      }
                    }}
                    className="mr-2"
                  />
                  {user.name}
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={handleDelete}
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