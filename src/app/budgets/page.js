'use client';

import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { exportToCSV } from '@/utils/exportUtils';
import { Download, PlusCircle, X, ArrowUp, ArrowDown } from 'lucide-react';
import useSWR from 'swr';
import { fetcher } from '@/utils/fetcher';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Edit2, Trash2, Calendar, DollarSign, Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Label } from "@/components/ui/label";

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
      <Button
        onClick={() => setShowForm(true)}
        className="gap-2"
      >
        <PlusCircle className="h-4 w-4" />
        Add Budget
      </Button>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Add New Budget</CardTitle>
          <CardDescription>Set your monthly budget for different categories</CardDescription>
        </CardHeader>
        <form ref={formRef} onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Month</label>
              <Input
                type="month"
                name="month"
                value={formData.month}
                onChange={handleChange}
                className={errors.month ? "border-red-500" : ""}
              />
              {errors.month && <p className="text-sm text-red-500">{errors.month}</p>}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleChange({ target: { name: 'category', value } })}
              >
                <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount (₹)</label>
              <Input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                className={errors.amount ? "border-red-500" : ""}
              />
              {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Budget</span>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

// BudgetList component - Enhanced
const BudgetList = ({ budgets, onEdit, onDelete, selectedMonth }) => {
  const [sortBy, setSortBy] = useState('category');
  const [sortOrder, setSortOrder] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Sort and filter budgets
  const sortedBudgets = [...budgets]
    .filter(budget => 
      budget.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = sortBy === 'category' ? a.category : a.budget;
      const bValue = sortBy === 'category' ? b.category : b.budget;
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  if (budgets.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            No budgets set for {format(new Date(selectedMonth + '-01'), 'MMMM yyyy')}.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Budget List</CardTitle>
            <CardDescription>Your monthly budget allocations</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-[200px]"
            />
            <Select value={sortBy} onValueChange={handleSort}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="category">Category</SelectItem>
                <SelectItem value="budget">Amount</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedBudgets.map((budget) => (
            <div 
              key={budget._id} 
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline"
                    className="capitalize"
                  >
                    {budget.category}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(budget.month + '-01'), 'MMMM yyyy')}
                  </span>
                </div>
                <div className="text-2xl font-bold">
                  ₹{budget.budget.toFixed(2)}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onEdit(budget)}
                  className="hover:bg-primary/10"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this budget?')) {
                      onDelete(budget._id);
                    }
                  }}
                  className="hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
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
    const percentUsed = budget.budget > 0 
      ? Math.round((categorySpending / budget.budget) * 100) 
      : 0;
    
    return {
      category: budget.category,
      budget: budget.budget,
      spent: categorySpending,
      percentUsed,
      remaining: Math.max(0, budget.budget - categorySpending),
      overspent: Math.max(0, categorySpending - budget.budget)
    };
  });
  
  // Calculate summary statistics
  const summary = {
    totalBudget: chartData.reduce((sum, item) => sum + item.budget, 0),
    totalSpent: chartData.reduce((sum, item) => sum + item.spent, 0),
    totalRemaining: chartData.reduce((sum, item) => sum + item.remaining, 0),
    totalOverspent: chartData.reduce((sum, item) => sum + item.overspent, 0),
    categoriesOverBudget: chartData.filter(item => item.percentUsed > 100).length,
    categoriesUnderBudget: chartData.filter(item => item.percentUsed <= 100).length
  };
  
  // Custom tooltip to show detailed information
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length && payload[0]?.payload) {
      const data = payload[0].payload;
      return (
        <Card className="p-4">
          <CardHeader className="p-0">
            <CardTitle className="text-sm">{data.category || 'Unknown'}</CardTitle>
          </CardHeader>
          <CardContent className="p-0 mt-2 space-y-1">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Budget:</span>
              <span className="text-sm font-medium">₹{(data.budget || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Spent:</span>
              <span className="text-sm font-medium">₹{(data.spent || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Remaining:</span>
              <span className="text-sm font-medium">₹{(data.remaining || 0).toFixed(2)}</span>
            </div>
            <div className="mt-2">
              <Progress 
                value={Math.min(data.percentUsed || 0, 100)} 
                className={`h-2 ${
                  (data.percentUsed || 0) > 100 
                    ? 'bg-red-100' 
                    : (data.percentUsed || 0) > 80 
                      ? 'bg-yellow-100' 
                      : 'bg-green-100'
                }`}
              />
              <p className="text-xs mt-1" style={{ 
                color: (data.percentUsed || 0) > 100 
                  ? '#ef4444' 
                  : (data.percentUsed || 0) > 80 
                    ? '#f59e0b' 
                    : '#10b981' 
              }}>
                {(data.percentUsed || 0)}% of budget used
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }
    return null;
  };
  
  // Sort chart data by percentage used (descending)
  const sortedChartData = [...chartData].sort((a, b) => b.percentUsed - a.percentUsed);
  
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{summary.totalBudget.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {chartData.length} categories
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{summary.totalSpent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {summary.categoriesOverBudget} over budget
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{summary.totalRemaining.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {summary.categoriesUnderBudget} under budget
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overspent</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₹{summary.totalOverspent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {summary.categoriesOverBudget} categories
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Budget vs. Actual Spending</CardTitle>
          <CardDescription>Comparison of planned budget and actual spending by category</CardDescription>
        </CardHeader>
        <CardContent>
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
            <div className="text-center p-8 text-muted-foreground">
              No budget data available for comparison
            </div>
          )}
        </CardContent>
      </Card>
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

// Main Budgets Page - Enhanced
const BudgetsPage = () => {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch budgets with error handling
  const { data: budgets = [], error: budgetsError, mutate: mutateBudgets } = useSWR(
    `/api/budgets?month=${selectedMonth}`,
    fetcher,
    {
      onError: (err) => {
        setError('Failed to load budgets. Please try again later.');
        console.error('Error fetching budgets:', err);
      },
      revalidateOnFocus: false,
    }
  );

  // Fetch spending data with error handling
  const { data: spendingData = [], error: spendingError } = useSWR(
    `/api/transactions/categories?month=${selectedMonth}`,
    fetcher,
    {
      onError: (err) => {
        setError('Failed to load spending data. Please try again later.');
        console.error('Error fetching spending data:', err);
      },
      revalidateOnFocus: false,
    }
  );

  // Handle form submission with loading state and error handling
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.target);
      const data = {
        category: formData.get('category'),
        month: selectedMonth,
        budget: parseFloat(formData.get('budget')),
      };

      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save budget');
      }

      await mutateBudgets();
      setIsFormOpen(false);
      setEditingBudget(null);
    } catch (err) {
      setError('Failed to save budget. Please try again.');
      console.error('Error saving budget:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle budget deletion with confirmation and error handling
  const handleDelete = async (budgetId) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/budgets/${budgetId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete budget');
      }

      await mutateBudgets();
    } catch (err) {
      setError('Failed to delete budget. Please try again.');
      console.error('Error deleting budget:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle budget edit
  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setIsFormOpen(true);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show error state
  if (error || budgetsError || spendingError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error || budgetsError?.message || spendingError?.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Budget Management</h1>
            <p className="text-muted-foreground">
              Manage your monthly budgets and track spending
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Select
              value={selectedMonth}
              onValueChange={setSelectedMonth}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => {
                  const date = new Date();
                  date.setMonth(date.getMonth() - i);
                  const value = format(date, 'yyyy-MM');
                  const label = format(date, 'MMMM yyyy');
                  return (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <Button onClick={() => setIsFormOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Budget
            </Button>
          </div>
        </div>

        <Tabs defaultValue="budgets" className="space-y-4">
          <TabsList>
            <TabsTrigger value="budgets">Budgets</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
          </TabsList>
          
          <TabsContent value="budgets" className="space-y-4">
            <BudgetList
              budgets={budgets}
              onEdit={handleEdit}
              onDelete={handleDelete}
              selectedMonth={selectedMonth}
            />
          </TabsContent>
          
          <TabsContent value="comparison">
            <BudgetComparisonChart
              budgetData={budgets}
              spendingData={spendingData}
            />
          </TabsContent>
        </Tabs>

        {isFormOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>
                  {editingBudget ? 'Edit Budget' : 'Add New Budget'}
                </CardTitle>
                <CardDescription>
                  Set your budget for {format(new Date(selectedMonth + '-01'), 'MMMM yyyy')}
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      name="category"
                      defaultValue={editingBudget?.category}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget Amount (₹)</Label>
                    <Input
                      type="number"
                      name="budget"
                      min="0"
                      step="0.01"
                      defaultValue={editingBudget?.budget}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsFormOpen(false);
                      setEditingBudget(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : editingBudget ? 'Update' : 'Add'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetsPage; 