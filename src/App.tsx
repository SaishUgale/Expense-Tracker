import { useState, useEffect } from 'react';
import { Expense, Budget, User, currencies } from './models/expense';
import { format } from 'date-fns';
import { AddExpenseModal } from './components/AddExpenseModal';
import { EditExpenseModal } from './components/EditExpenseModal';
import { EditBudgetModal } from './components/EditBudgetModal';
import { AddUserModal } from './components/AddUserModal';
import { AddBudgetModal } from './components/AddBudgetModal';

// Load data from localStorage
const loadFromStorage = (key: string, defaultValue: any) => {
  const stored = localStorage.getItem(key);
  if (!stored) return defaultValue;
  try {
    const data = JSON.parse(stored);
    if (key === 'expenses') {
      // Convert date strings back to Date objects
      return data.map((expense: any) => ({
        ...expense,
        date: new Date(expense.date)
      }));
    }
    return data;
  } catch {
    return defaultValue;
  }
};

export default function App() {
  const [expenses, setExpenses] = useState<Expense[]>(() => 
    loadFromStorage('expenses', [])
  );
  const [users, setUsers] = useState<User[]>(() => 
    loadFromStorage('users', [])
  );
  const [selectedCurrency, setSelectedCurrency] = useState(() => 
    loadFromStorage('currency', currencies[0].code)
  );
  const [budgets, setBudgets] = useState<Budget[]>(() => 
    loadFromStorage('budgets', [])
  );
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isAddBudgetOpen, setIsAddBudgetOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('currency', selectedCurrency);
    // Update all expenses and budgets when currency changes
    setExpenses(prev => prev.map(expense => ({ ...expense, currency: selectedCurrency })));
    setBudgets(prev => prev.map(budget => ({ ...budget, currency: selectedCurrency })));
  }, [selectedCurrency]);

  useEffect(() => {
    localStorage.setItem('budgets', JSON.stringify(budgets));
  }, [budgets]);

  // Update budget spent amounts whenever expenses change
  useEffect(() => {
    const categoryTotals = expenses.reduce((totals, expense) => {
      totals[expense.category] = (totals[expense.category] || 0) + expense.amount;
      return totals;
    }, {} as Record<string, number>);

    setBudgets(prev => prev.map(budget => ({
      ...budget,
      spent: categoryTotals[budget.category] || 0
    })));
  }, [expenses]);

  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const getCurrencySymbol = (code: string) => {
    return currencies.find(c => c.code === code)?.symbol || code;
  };

  const addUser = (data: { name: string }) => {
    const newUser: User = {
      id: Date.now().toString(),
      name: data.name
    };
    setUsers(prev => [...prev, newUser]);
  };

  const addBudget = (data: { category: string; limit: number }) => {
    const newBudget: Budget = {
      category: data.category,
      limit: data.limit,
      spent: calculateCategorySpent(data.category),
      currency: selectedCurrency
    };
    setBudgets(prev => [...prev, newBudget]);
  };

  const calculateCategorySpent = (category: string) => {
    return expenses
      .filter(expense => expense.category === category)
      .reduce((total, expense) => total + expense.amount, 0);
  };

  const addExpense = (data: {
    amount: number;
    category: string;
    description: string;
    paidBy: string;
    splitBetween: string[];
  }) => {
    // Ensure splitBetween is not empty
    const splitBetween = data.splitBetween.length > 0 ? data.splitBetween : [data.paidBy];
    
    const newExpense: Expense = {
      id: Date.now().toString(),
      date: new Date(),
      currency: selectedCurrency,
      ...data,
      splitBetween
    };

    setExpenses(prev => [newExpense, ...prev]);
  };

  const editExpense = (id: string, data: {
    amount: number;
    category: string;
    description: string;
    paidBy: string;
    splitBetween: string[];
  }) => {
    // Ensure splitBetween is not empty
    const splitBetween = data.splitBetween.length > 0 ? data.splitBetween : [data.paidBy];
    
    setExpenses(prev => prev.map(expense =>
      expense.id === id
        ? { ...expense, ...data, splitBetween, currency: selectedCurrency }
        : expense
    ));
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
  };

  const editBudget = (category: string, data: { limit: number }) => {
    setBudgets(prev =>
      prev.map(budget =>
        budget.category === category
          ? { ...budget, limit: data.limit }
          : budget
      )
    );
  };

  const deleteBudget = (category: string) => {
    if (confirm('Are you sure you want to delete this budget?')) {
      setBudgets(prev => prev.filter(budget => budget.category !== category));
    }
  };

  const getUserName = (userId: string) => {
    return users.find(user => user.id === userId)?.name || 'Unknown';
  };

  const getBudgetStatus = (budget: Budget) => {
    const percentage = (budget.spent / budget.limit) * 100;
    if (percentage >= 100) {
      return { color: 'bg-red-600', message: 'Budget exceeded!' };
    }
    if (percentage >= 80) {
      return { color: 'bg-yellow-500', message: 'Near budget limit!' };
    }
    return { color: 'bg-purple-600', message: '' };
  };

  const getExpenseSplitAmount = (expense: Expense) => {
    const splitCount = expense.splitBetween.length || 1;
    return expense.amount / splitCount;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-purple-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Expense Tracker</h1>
          <select
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
            className="bg-purple-700 text-white px-3 py-1 rounded-md"
          >
            {currencies.map(curr => (
              <option key={curr.code} value={curr.code}>
                {curr.code} ({curr.symbol})
              </option>
            ))}
          </select>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Dashboard Section */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg text-gray-600 text-center">Total Spending</h2>
              <p className="text-3xl font-bold text-center text-purple-600">
                {getCurrencySymbol(selectedCurrency)}{totalSpent.toFixed(2)}
              </p>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setIsAddExpenseOpen(true)}
                className="flex-1 bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
              >
                + Add Expense
              </button>
              <button
                onClick={() => setIsAddUserOpen(true)}
                className="flex-1 bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                + Add User
              </button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">Recent Expenses</h2>
              <div className="space-y-4">
                {expenses.map(expense => (
                  <div
                    key={expense.id}
                    className="border-b border-gray-200 pb-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                    onClick={() => setEditingExpense(expense)}
                  >
                    <div className="flex justify-between">
                      <span className="font-semibold">{expense.description}</span>
                      <div className="text-right">
                        <span className="text-purple-600">
                          {getCurrencySymbol(selectedCurrency)}{expense.amount.toFixed(2)}
                        </span>
                        {expense.splitBetween.length > 1 && (
                          <div className="text-sm text-gray-500">
                            ({expense.splitBetween.length} way split: {getCurrencySymbol(selectedCurrency)}{getExpenseSplitAmount(expense).toFixed(2)} each)
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{expense.category}</span>
                      <span>{format(new Date(expense.date), 'MMM d, yyyy')}</span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      <div>Paid by: {getUserName(expense.paidBy)}</div>
                      <div>Split between: {expense.splitBetween.map(id => getUserName(id)).join(', ')}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Budgets Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Budgets</h2>
              <button
                onClick={() => setIsAddBudgetOpen(true)}
                className="bg-purple-600 text-white px-3 py-1 rounded-md hover:bg-purple-700 transition-colors"
              >
                + Add Budget
              </button>
            </div>
            <div className="space-y-6">
              {budgets.map(budget => {
                const status = getBudgetStatus(budget);
                return (
                  <div 
                    key={budget.category}
                    className="cursor-pointer hover:bg-gray-50 p-2 rounded"
                    onClick={() => setEditingBudget(budget)}
                  >
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold">{budget.category}</span>
                      <div className="text-right">
                        <span className="text-sm text-gray-600">
                          {getCurrencySymbol(selectedCurrency)}{budget.spent.toFixed(2)}/{budget.limit}
                        </span>
                        {status.message && (
                          <div className="text-xs text-red-600 font-medium">
                            {status.message}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`${status.color} h-2.5 rounded-full transition-all duration-300`}
                        style={{
                          width: `${Math.min((budget.spent / budget.limit) * 100, 100)}%`
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        onAdd={addExpense}
        users={users}
        currency={selectedCurrency}
      />

      <AddBudgetModal
        isOpen={isAddBudgetOpen}
        onClose={() => setIsAddBudgetOpen(false)}
        onAdd={addBudget}
        existingCategories={budgets.map(b => b.category)}
      />

      {editingExpense && (
        <EditExpenseModal
          isOpen={true}
          onClose={() => setEditingExpense(null)}
          onEdit={editExpense}
          onDelete={deleteExpense}
          expense={editingExpense}
          users={users}
          currency={selectedCurrency}
        />
      )}

      {editingBudget && (
        <EditBudgetModal
          isOpen={true}
          onClose={() => setEditingBudget(null)}
          onEdit={editBudget}
          onDelete={deleteBudget}
          budget={editingBudget}
        />
      )}

      <AddUserModal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        onAdd={addUser}
      />
    </div>
  );
}

