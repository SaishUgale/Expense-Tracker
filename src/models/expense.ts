export interface User {
  id: string;
  name: string;
}

export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: Date;
  currency: string;
  paidBy: string;
  splitBetween: string[];
}

export interface Budget {
  category: string;
  limit: number;
  spent: number;
  currency: string;
}

export const categories = [
  'Food',
  'Transportation',
  'Shopping',
  'Bills',
  'Entertainment',
  'Other'
];

export const currencies = [
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'JPY', symbol: '¥' },
  { code: 'INR', symbol: '₹' }
];