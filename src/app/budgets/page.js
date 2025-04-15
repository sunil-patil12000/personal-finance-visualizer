'use client';

import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { exportToCSV } from '@/utils/exportUtils';
import { Download, PlusCircle, X } from 'lucide-react';
import useSWR from 'swr';
import { fetcher } from '@/utils/fetcher';

const CATEGORIES = [
  'Food', 'Transport', 'Entertainment', 'Utilities', 
  'Housing', 'Healthcare', 'Education', 'Other'
];

const COLORS = {
  budget: '#8884d8',
  actual: '#82ca9d',
  over: '#ff8042'
};

// BudgetForm Component - Enhanced
const BudgetForm = ({ budgets, onSaveBudget }) => {
  const [formData, setFormData] = useState({ 
    category: '',
    amount: '',
    month: new Date().toISOString().slice(0, 7), // YYYY-MM format
  });
  const [errors, setErrors] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef(null);
  
  const { data: categories } = useSWR('/api/categories', fetcher);
  
  // Filter out categories that already have budgets for this month
  const availableCategories = categories?.filter(cat => 
    !budgets?.some(budget => 
      budget.category === cat.name && 
      budget.month === formData.month
    )
  ) || [];
  
  const validate = () => {
    const newErrors = {};
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(formData.amount) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear the error for this field when the user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      const budget = {
        ...formData,
        amount: parseFloat(formData.amount),
      };
      
      await onSaveBudget(budget);
      
      // Reset form
      setFormData({ 
        category: '',
        amount: '',
        month: formData.month, // Keep the same month
      });
      setShowForm(false);
    } catch (error) {
      console.error('Error saving budget:', error);
      setErrors({ submit: 'Failed to save budget. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Close the form when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) {
        setShowForm(false);
      }
    };
    
    if (showForm) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showForm]);
  
  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
      >
        <PlusCircle size={16} />
        Add Budget
      </button>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <form 
        ref={formRef}
        onSubmit={handleSubmit} 
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Add New Budget</h2>
          <button 
            type="button" 
            onClick={() => setShowForm(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="month">
            Month
          </label>
          <input
            type="month"
            id="month"
            name="month"
            value={formData.month}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`shadow appearance-none border ${errors.category ? 'border-red-500' : 'border-gray-300'} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
          >
            <option value="">Select a category</option>
            {availableCategories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
            {availableCategories.length === 0 && categories?.length > 0 && (
              <option disabled value="">All categories have budgets for this month</option>
            )}
          </select>
          {errors.category && <p className="text-red-500 text-xs italic mt-1">{errors.category}</p>}
          
          {availableCategories.length === 0 && categories?.length > 0 && (
            <p className="text-amber-600 text-xs mt-2">
              Tip: Change the month or create a new category to add more budgets.
            </p>
          )}
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="amount">
            Amount (₹)
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            min="0"
            step="0.01"
            value={formData.amount}
            onChange={handleChange}
            className={`shadow appearance-none border ${errors.amount ? 'border-red-500' : 'border-gray-300'} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
            placeholder="0.00"
          />
          {errors.amount && <p className="text-red-500 text-xs italic mt-1">{errors.amount}</p>}
        </div>
        
        {errors.submit && (
          <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
            {errors.submit}
          </div>
        )}
        
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center gap-2 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Budget</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// Budget list component
const BudgetList = ({ budgets, onEdit, onDelete, selectedMonth }) => {
  if (budgets.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <p className="text-gray-600">No budgets set for {format(new Date(selectedMonth + '-01'), 'MMMM yyyy')}.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {budgets.map((budget) => (
            <tr key={budget._id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {budget.category}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                ₹{budget.budget.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <button
                  onClick={() => onEdit(budget)}
                  className="text-blue-600 hover:text-blue-900 mr-3"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this budget?')) {
                      onDelete(budget._id);
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

// Budget vs Actual comparison chart
const BudgetComparisonChart = ({ budgetData, spendingData }) => {
  // Create data for comparison chart
  const chartData = budgetData.map(budget => {
    // Find corresponding spending for this category
    const categorySpending = spendingData.find(item => 
      item.category === budget.category
    )?.amount || 0;
    
    // Calculate percentage of budget used
    const percentUsed = budget.amount > 0 
      ? Math.round((categorySpending / budget.amount) * 100) 
      : 0;
    
    return {
      category: budget.category,
      budget: budget.amount,
      spent: categorySpending,
      percentUsed,
      remaining: Math.max(0, budget.amount - categorySpending),
      overspent: Math.max(0, categorySpending - budget.amount)
    };
  });
  
  // Custom tooltip to show detailed information
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length && payload[0]?.payload) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border rounded shadow-md">
          <p className="font-bold text-gray-800">{data.category || 'Unknown'}</p>
          <div className="text-gray-700 mb-2">
            <strong>Budget:</strong> ₹{(data.budget || 0).toFixed(2)}
          </div>
          <div className="text-gray-700 mb-2">
            <strong>Spent:</strong> ₹{(data.spent || 0).toFixed(2)}
          </div>
          <div className="text-gray-700 mb-2">
            <strong>Remaining:</strong> ₹{(data.remaining || 0).toFixed(2)}
          </div>
          <p className="text-sm font-medium mt-1" style={{ 
            color: (data.percentUsed || 0) > 100 
              ? '#ef4444' 
              : (data.percentUsed || 0) > 80 
                ? '#f59e0b' 
                : '#10b981' 
          }}>
            {(data.percentUsed || 0)}% of budget used
          </p>
        </div>
      );
    }
    return null;
  };
  
  // Sort chart data by percentage used (descending)
  const sortedChartData = [...chartData].sort((a, b) => b.percentUsed - a.percentUsed);
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-bold mb-4">Budget vs. Actual Spending</h2>
      
      {sortedChartData.length > 0 ? (
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sortedChartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="category" 
                angle={-45} 
                textAnchor="end" 
                height={70}
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip 
                content={<CustomTooltip />}
                formatter={(value, name) => {
                  if (name === 'spent') return [`₹${(value || 0).toFixed(2)}`, 'Spent'];
                  if (name === 'remaining') return [`₹${(value || 0).toFixed(2)}`, 'Remaining'];
                  return [value, name];
                }} 
              />
              <Legend />
              <Bar 
                dataKey="budget" 
                name="Budget" 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]} 
              />
              <Bar 
                dataKey="spent" 
                name="Actual Spending" 
                fill="#10b981"
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="text-center p-8 text-gray-500">
          No budget data available for comparison
        </div>
      )}
      
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-3 rounded border border-blue-200">
          <h3 className="font-medium text-blue-800">Budget Colors</h3>
          <p className="text-sm text-gray-600">Blue bars show your planned budget for each category</p>
        </div>
        <div className="bg-green-50 p-3 rounded border border-green-200">
          <h3 className="font-medium text-green-800">Under Budget</h3>
          <p className="text-sm text-gray-600">Green bars mean you're spending less than planned</p>
        </div>
        <div className="bg-red-50 p-3 rounded border border-red-200">
          <h3 className="font-medium text-red-800">Over Budget</h3>
          <p className="text-sm text-gray-600">Red bars indicate you've exceeded your budget</p>
        </div>
      </div>
    </div>
  );
};

// ExportButton component
const ExportBudgetButton = ({ budgets, comparisonData, selectedMonth }) => {
  // Prepare export data by combining budget and actual spending
  const prepareExportData = () => {
    // Create a map of budgets by category for easy lookup
    const budgetMap = budgets.reduce((map, budget) => {
      map[budget.category] = budget.amount;
      return map;
    }, {});
    
    // Map comparison data to export format
    return comparisonData.map(item => ({
      category: item.category,
      budget: item.budget,
      actual: item.actual,
      remaining: item.remaining,
      status: item.status === 'over' ? 'Over Budget' : 'Under Budget',
      percentUsed: `${Math.min(item.percentage, 1000).toFixed(0)}%`
    }));
  };
  
  const handleExport = () => {
    const exportData = prepareExportData();
    
    const headers = [
      { key: 'category', display: 'Category' },
      { key: 'amount', display: 'Budget Amount (₹)', type: 'currency' },
      { key: 'actual', display: 'Spent Amount (₹)', type: 'currency' },
      { key: 'remaining', display: 'Remaining (₹)', type: 'currency' },
      { key: 'status', display: 'Status' },
      { key: 'percentUsed', display: '% Used' }
    ];
    
    const formattedMonth = format(new Date(selectedMonth + '-01'), 'MMMM-yyyy');
    const fileName = `budget-report-${formattedMonth}.csv`;
    
    exportToCSV(exportData, headers, fileName);
  };
  
  return (
    <button
      onClick={handleExport}
      disabled={!comparisonData.length}
      className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm ${
        comparisonData.length 
          ? 'bg-green-600 text-white hover:bg-green-700' 
          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
      }`}
    >
      <Download size={16} />
      <span>Export Report</span>
    </button>
  );
};

// Main Budgets Page
export default function BudgetsPage() {
  const [budgets, setBudgets] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingBudget, setEditingBudget] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

  // Generate the list of months (current month and 11 previous months)
  const generateMonthOptions = () => {
    const options = [];
    const today = new Date();
    
    for (let i = 0; i < 12; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const value = format(d, 'yyyy-MM');
      const label = format(d, 'MMMM yyyy');
      options.push({ value, label });
    }
    
    return options;
  };

  // Fetch budgets for the selected month
  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/budgets?month=${selectedMonth}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch budgets');
      }
      
      const data = await response.json();
      setBudgets(data);
      setLoading(false);
    } catch (error) {
      setError('Error loading budgets. Please check your database connection.');
      setBudgets([]);
      setLoading(false);
      console.error('Error fetching budgets:', error);
    }
  };

  // Fetch comparison data
  const fetchComparisonData = async () => {
    try {
      const response = await fetch(`/api/budgets/comparison?month=${selectedMonth}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch comparison data');
      }
      
      const data = await response.json();
      setComparisonData(data);
    } catch (error) {
      setComparisonData([]);
      console.error('Error fetching comparison data:', error);
    }
  };

  // Load data when component mounts or selected month changes
  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchBudgets();
        await fetchComparisonData();
      } catch (error) {
        console.error('Error loading budget page data:', error);
      }
    };
    
    loadData();
  }, [selectedMonth]);

  // Add budget
  const handleAddBudget = async (formData) => {
    try {
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to add budget');
      }

      // Refresh data
      fetchBudgets();
      fetchComparisonData();
    } catch (error) {
      setError('Error adding budget. Please try again.');
      console.error('Error adding budget:', error);
    }
  };

  // Update budget
  const handleUpdateBudget = async (formData) => {
    try {
      const response = await fetch(`/api/budgets/${editingBudget._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update budget');
      }

      // Refresh data and reset editing state
      setEditingBudget(null);
      fetchBudgets();
      fetchComparisonData();
    } catch (error) {
      setError('Error updating budget. Please try again.');
      console.error('Error updating budget:', error);
    }
  };

  // Delete budget
  const handleDeleteBudget = async (id) => {
    try {
      const response = await fetch(`/api/budgets/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete budget');
      }

      // Refresh data
      fetchBudgets();
      fetchComparisonData();
    } catch (error) {
      setError('Error deleting budget. Please try again.');
      console.error('Error deleting budget:', error);
    }
  };

  // Handle form submission (add or update)
  const handleSubmit = (formData) => {
    if (editingBudget) {
      handleUpdateBudget(formData);
    } else {
      handleAddBudget(formData);
    }
  };

  // Handle month change
  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  const monthOptions = generateMonthOptions();

  if (loading && budgets.length === 0) {
    return <div className="text-center p-6">Loading budgets...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Budgets</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <label className="font-semibold mr-2">Select Month:</label>
            <select 
              value={selectedMonth}
              onChange={handleMonthChange}
              className="p-2 border rounded"
            >
              {monthOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <ExportBudgetButton 
            budgets={budgets} 
            comparisonData={comparisonData}
            selectedMonth={selectedMonth}
          />
        </div>
      </div>
      
      <BudgetForm 
        budgets={budgets}
        onSaveBudget={handleSubmit}
      />
      
      <h2 className="text-xl font-bold mb-4">Budgets for {format(new Date(selectedMonth + '-01'), 'MMMM yyyy')}</h2>
      <BudgetList 
        budgets={budgets} 
        onEdit={setEditingBudget}
        onDelete={handleDeleteBudget}
        selectedMonth={selectedMonth}
      />
      
      {budgets && budgets.length > 0 && comparisonData && (
        <BudgetComparisonChart 
          budgetData={budgets.filter(b => b.month === selectedMonth)} 
          spendingData={comparisonData}
        />
      )}
    </div>
  );
} 