'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { exportToCSV } from '@/utils/exportUtils';
import { Download, Filter } from 'lucide-react';

// Transaction form component
const TransactionForm = ({ onSubmit, initialData, isEditing, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState({
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    category: '',
    isRecurring: false,
    recurringFrequency: ''
  });
  const [errors, setErrors] = useState({});

  // Predefined categories
  const categories = [
    'Food', 
    'Transport', 
    'Entertainment', 
    'Utilities', 
    'Housing', 
    'Healthcare', 
    'Education', 
    'Other'
  ];

  useEffect(() => {
    if (initialData) {
      setFormData({
        amount: initialData.amount,
        date: format(new Date(initialData.date), 'yyyy-MM-dd'),
        description: initialData.description,
        category: initialData.category || '',
        isRecurring: initialData.isRecurring || false,
        recurringFrequency: initialData.recurringFrequency || ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    // Handle special case for isRecurring checkbox
    if (name === 'isRecurring' && !newValue) {
      setFormData({ 
        ...formData, 
        [name]: newValue,
        recurringFrequency: '' // Reset frequency when unchecking isRecurring
      });
    } else {
      setFormData({ ...formData, [name]: newValue });
    }
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (formData.isRecurring && !formData.recurringFrequency) {
      newErrors.recurringFrequency = 'Please select a frequency for recurring transactions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit({
        ...formData,
        amount: parseFloat(formData.amount)
      });
      
      // Don't reset the form immediately to prevent UI flicker
      // Form will be reset after the API call completes
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-bold mb-4">{isEditing ? 'Edit Transaction' : 'Add New Transaction'}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="amount">
            Amount (₹)
          </label>
          <input
            type="number"
            step="0.01"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="0.00"
            disabled={isSubmitting}
          />
          {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="date">
            Date
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            disabled={isSubmitting}
          />
          {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="description">
            Description
          </label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Groceries, rent, etc."
            disabled={isSubmitting}
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="category">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${errors.category ? 'border-red-500' : 'border-gray-300'}`}
            disabled={isSubmitting}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
        </div>
        
        <div className="mb-4 col-span-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isRecurring"
              name="isRecurring"
              checked={formData.isRecurring}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              disabled={isSubmitting}
            />
            <label className="ml-2 block text-gray-700" htmlFor="isRecurring">
              This is a recurring transaction
            </label>
          </div>
        </div>
        
        {formData.isRecurring && (
          <div className="mb-4 col-span-2">
            <label className="block text-gray-700 mb-2" htmlFor="recurringFrequency">
              Frequency
            </label>
            <select
              id="recurringFrequency"
              name="recurringFrequency"
              value={formData.recurringFrequency}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              disabled={isSubmitting}
            >
              <option value="">Select frequency</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
            {errors.recurringFrequency && <p className="text-red-500 text-sm mt-1">{errors.recurringFrequency}</p>}
          </div>
        )}
      </div>
      
      <div className="flex justify-between mt-4">
        <button
          type="submit"
          className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
          disabled={isSubmitting}
        >
          {isSubmitting && (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]"></span>
          )}
          {isEditing ? 'Update' : 'Add'} Transaction
        </button>
        
        {isEditing && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
            disabled={isSubmitting}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

// Transaction filters component
const TransactionFilters = ({ onFilterChange, categories }) => {
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    dateFrom: '',
    dateTo: ''
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedFilters = { ...filters, [name]: value };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };
  
  const handleReset = () => {
    const resetFilters = {
      search: '',
      category: '',
      dateFrom: '',
      dateTo: ''
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <h2 className="text-lg font-semibold mb-3">Filter Transactions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-gray-700 mb-1 text-sm" htmlFor="search">
            Search
          </label>
          <input
            type="text"
            id="search"
            name="search"
            value={filters.search}
            onChange={handleChange}
            className="w-full p-2 border rounded text-sm"
            placeholder="Search by description"
          />
        </div>
        
        <div>
          <label className="block text-gray-700 mb-1 text-sm" htmlFor="category">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={filters.category}
            onChange={handleChange}
            className="w-full p-2 border rounded text-sm"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-gray-700 mb-1 text-sm" htmlFor="dateFrom">
            From Date
          </label>
          <input
            type="date"
            id="dateFrom"
            name="dateFrom"
            value={filters.dateFrom}
            onChange={handleChange}
            className="w-full p-2 border rounded text-sm"
          />
        </div>
        
        <div>
          <label className="block text-gray-700 mb-1 text-sm" htmlFor="dateTo">
            To Date
          </label>
          <input
            type="date"
            id="dateTo"
            name="dateTo"
            value={filters.dateTo}
            onChange={handleChange}
            className="w-full p-2 border rounded text-sm"
          />
        </div>
      </div>
      <div className="flex justify-end">
        <button
          onClick={handleReset}
          className="bg-gray-300 text-gray-800 px-4 py-1 rounded hover:bg-gray-400 text-sm"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};

// Transaction list component
const TransactionList = ({ transactions, onEdit, onDelete }) => {
  if (transactions.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <p className="text-gray-600">No transactions yet. Add one to get started!</p>
      </div>
    );
  }

  // Helper function to format recurring frequency
  const formatFrequency = (frequency) => {
    switch (frequency) {
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      case 'yearly': return 'Yearly';
      default: return '';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transactions.map((transaction) => (
            <tr key={transaction._id}>
              <td className="px-6 py-4 whitespace-nowrap">
                {format(new Date(transaction.date), 'MMM dd, yyyy')}
              </td>
              <td className="px-6 py-4">{transaction.description}</td>
              <td className="px-6 py-4">
                <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {transaction.category}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                ₹{transaction.amount.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {transaction.isRecurring ? (
                  <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                    {formatFrequency(transaction.recurringFrequency)}
                  </span>
                ) : (
                  <span className="text-gray-400 text-sm">One-time</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <button
                  onClick={() => onEdit(transaction)}
                  className="text-blue-600 hover:text-blue-900 mr-3"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this transaction?')) {
                      onDelete(transaction._id);
                    }
                  }}
                  className="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Monthly expenses chart component
const MonthlyExpensesChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-center mt-6">
        <p className="text-gray-600">No data available for the chart yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <h2 className="text-xl font-bold mb-4">Monthly Expenses</h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
            <YAxis 
              tickFormatter={(value) => `₹${value}`}
              label={{ value: 'Amount (₹)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
            />
            <Tooltip formatter={(value) => [`₹${value}`, 'Amount']} />
            <Bar dataKey="amount" fill="#4f46e5" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Add a component for exporting transactions
const ExportButton = ({ transactions }) => {
  const handleExport = () => {
    const headers = [
      { key: 'date', display: 'Date', type: 'date' },
      { key: 'description', display: 'Description' },
      { key: 'category', display: 'Category' },
      { key: 'amount', display: 'Amount (₹)', type: 'currency' }
    ];
    
    const fileName = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    exportToCSV(transactions, headers, fileName);
  };
  
  return (
    <button
      onClick={handleExport}
      disabled={!transactions.length}
      className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm ${
        transactions.length 
          ? 'bg-green-600 text-white hover:bg-green-700' 
          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
      }`}
    >
      <Download size={16} />
      <span>Export CSV</span>
    </button>
  );
};

// Add a component to fix categories for existing transactions
const CategoryFixer = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [count, setCount] = useState(0);

  const checkTransactionsToFix = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/transactions/migrate');
      
      if (!response.ok) {
        throw new Error('Failed to check transactions');
      }
      
      const data = await response.json();
      setCount(data.transactionsToFix);
      
      if (data.transactionsToFix === 0) {
        setMessage('No transactions need category fixes');
      } else {
        setMessage(`Found ${data.transactionsToFix} transactions that need categories fixed`);
      }
    } catch (error) {
      console.error('Error checking transactions:', error);
      setMessage('Error checking transactions');
    } finally {
      setLoading(false);
    }
  };

  const fixCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/transactions/migrate', {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Failed to migrate transactions');
      }
      
      const data = await response.json();
      setMessage(data.message);
      setCount(0);
      
    } catch (error) {
      console.error('Error fixing transactions:', error);
      setMessage('Error fixing transaction categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkTransactionsToFix();
  }, []);

  if (count === 0 && !message.includes('Error')) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
      <h3 className="font-semibold text-yellow-800 mb-2">Transaction Category Fixer</h3>
      <p className="text-sm text-yellow-700 mb-3">{message}</p>
      
      <div className="flex gap-2">
        <button
          onClick={checkTransactionsToFix}
          disabled={loading}
          className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded text-sm hover:bg-yellow-200"
        >
          Check Again
        </button>
        
        {count > 0 && (
          <button
            onClick={fixCategories}
            disabled={loading}
            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
          >
            Fix Categories
          </button>
        )}
        
        {loading && <span className="text-sm text-gray-500">Loading...</span>}
      </div>
    </div>
  );
};

// Main Transactions Page
export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);
  
  // Categories array
  const categories = [
    'Food', 
    'Transport', 
    'Entertainment', 
    'Utilities', 
    'Housing', 
    'Healthcare', 
    'Education', 
    'Other'
  ];

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/transactions');
      
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      
      const data = await response.json();
      setTransactions(data);
      setLoading(false);
    } catch (error) {
      setError('Error loading transactions. Please check your database connection.');
      setTransactions([]);
      setLoading(false);
      console.error('Error fetching transactions:', error);
    }
  };

  // Fetch monthly data for chart
  const fetchMonthlyData = async () => {
    try {
      const response = await fetch('/api/transactions/monthly');
      
      if (!response.ok) {
        throw new Error('Failed to fetch monthly data');
      }
      
      const data = await response.json();
      setMonthlyData(data);
    } catch (error) {
      setMonthlyData([]);
      console.error('Error fetching monthly data:', error);
    }
  };

  // Apply filters to transactions
  const applyFilters = (transactions, filters) => {
    return transactions.filter(transaction => {
      // Search filter
      if (filters.search && !transaction.description.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      
      // Category filter
      if (filters.category && transaction.category !== filters.category) {
        return false;
      }
      
      // Date range filters
      const transactionDate = new Date(transaction.date);
      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        if (transactionDate < fromDate) {
          return false;
        }
      }
      
      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999); // Set to end of day
        if (transactionDate > toDate) {
          return false;
        }
      }
      
      return true;
    });
  };

  // Handle filter changes
  const handleFilterChange = (filters) => {
    setFilteredTransactions(applyFilters(transactions, filters));
  };

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchTransactions();
        await fetchMonthlyData();
      } catch (error) {
        console.error('Error loading transactions page data:', error);
      }
    };
    
    loadData();
  }, []);
  
  // Update filtered transactions when transactions change
  useEffect(() => {
    setFilteredTransactions(transactions);
  }, [transactions]);

  // Add transaction
  const handleAddTransaction = async (formData) => {
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to add transaction');
      }

      // Add the new transaction to state directly for optimistic UI update
      const newTransaction = await response.json();
      setTransactions(prev => [newTransaction, ...prev]);
      setFilteredTransactions(prev => [newTransaction, ...prev]);
      
      // Reset form by forcing a re-render with a key change
      setFormKey(prevKey => prevKey + 1);
      
      // Refresh chart data - can be done in the background
      fetchMonthlyData();
      
      // Only show success message, don't reload all transactions
      setError(null);
    } catch (error) {
      setError('Error adding transaction. Please try again.');
      console.error('Error adding transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update transaction
  const handleUpdateTransaction = async (formData) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/transactions/${editingTransaction._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update transaction');
      }

      const updatedTransaction = await response.json();
      
      // Update local state without fetching all transactions again
      setTransactions(prev => 
        prev.map(t => t._id === updatedTransaction._id ? updatedTransaction : t)
      );
      setFilteredTransactions(prev => 
        prev.map(t => t._id === updatedTransaction._id ? updatedTransaction : t)
      );
      
      // Reset editing state
      setEditingTransaction(null);
      
      // Refresh chart data - can be done in the background
      fetchMonthlyData();
      
      setError(null);
    } catch (error) {
      setError('Error updating transaction. Please try again.');
      console.error('Error updating transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete transaction
  const handleDeleteTransaction = async (id) => {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete transaction');
      }

      // Refresh data
      fetchTransactions();
      fetchMonthlyData();
    } catch (error) {
      setError('Error deleting transaction. Please try again.');
      console.error('Error deleting transaction:', error);
    }
  };

  // Handle form submission (add or update)
  const handleSubmit = (formData) => {
    if (editingTransaction) {
      handleUpdateTransaction(formData);
    } else {
      handleAddTransaction(formData);
    }
  };

  // State to force form re-render on submission
  const [formKey, setFormKey] = useState(0);

  if (loading) {
    return <div className="text-center p-6">Loading transactions...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Transactions</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      <CategoryFixer />
      
      <TransactionForm 
        key={formKey}
        onSubmit={handleSubmit}
        initialData={editingTransaction}
        isEditing={!!editingTransaction}
        onCancel={() => setEditingTransaction(null)}
        isSubmitting={isSubmitting}
      />
      
      <TransactionFilters 
        onFilterChange={handleFilterChange} 
        categories={categories}
      />
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Transaction History</h2>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500">
            {filteredTransactions.length === transactions.length 
              ? `Showing all ${transactions.length} transactions` 
              : `Showing ${filteredTransactions.length} of ${transactions.length} transactions`
            }
          </div>
          <ExportButton transactions={filteredTransactions} />
        </div>
      </div>
      
      <TransactionList 
        transactions={filteredTransactions} 
        onEdit={setEditingTransaction}
        onDelete={handleDeleteTransaction}
      />
      
      <MonthlyExpensesChart data={monthlyData} />
    </div>
  );
} 