'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import useSWR from 'swr';
import { fetcher } from '@/utils/fetcher';
import { exportToCSV } from '@/utils/exportUtils';
import { Edit2, Trash2, PlusCircle, Download, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const TransactionForm = ({ onSubmit, initialData = null, onCancel }) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    isRecurring: false,
    recurringFrequency: ''
  });
  const [error, setError] = useState(null);

  const CATEGORIES = [
    'Food & Dining',
    'Transportation',
    'Housing',
    'Utilities',
    'Shopping',
    'Entertainment',
    'Healthcare',
    'Education',
    'Personal Care',
    'Other'
  ];

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        date: format(new Date(initialData.date), 'yyyy-MM-dd')
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'isRecurring' && !checked) {
      setFormData(prev => ({
        ...prev,
        [name]: checked,
        recurringFrequency: ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const data = {
        ...formData,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date)
      };

      await onSubmit(data);
      
      if (!initialData) {
        setFormData({
          description: '',
          amount: '',
          category: '',
          date: format(new Date(), 'yyyy-MM-dd'),
          isRecurring: false,
          recurringFrequency: ''
        });
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? 'Edit Transaction' : 'Add Transaction'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              name="category"
              value={formData.category}
              onValueChange={(value) => handleChange({ target: { name: 'category', value } })}
            >
              <SelectTrigger>
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
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isRecurring"
              name="isRecurring"
              checked={formData.isRecurring}
              onCheckedChange={(checked) => handleChange({ target: { name: 'isRecurring', checked } })}
            />
            <Label htmlFor="isRecurring">Recurring Transaction</Label>
          </div>
          {formData.isRecurring && (
            <div className="space-y-2">
              <Label htmlFor="recurringFrequency">Frequency</Label>
              <Select
                name="recurringFrequency"
                value={formData.recurringFrequency}
                onValueChange={(value) => handleChange({ target: { name: 'recurringFrequency', value } })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit">
            {initialData ? 'Update' : 'Add'} Transaction
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

const TransactionFilters = ({ 
  searchTerm, 
  setSearchTerm, 
  selectedCategory, 
  setSelectedCategory, 
  dateRange, 
  setDateRange,
  categories 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={selectedCategory}
            onValueChange={setSelectedCategory}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Date Range</Label>
          <div className="flex gap-2">
            <Input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
            />
            <Input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const TransactionList = ({ transactions, onEdit, onDelete }) => {
  const formatRecurringFrequency = (frequency) => {
    switch (frequency) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      case 'yearly': return 'Yearly';
      default: return '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Recurring</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map(transaction => (
              <TableRow key={transaction._id}>
                <TableCell>{format(new Date(transaction.date), 'MMM dd, yyyy')}</TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell>{transaction.category}</TableCell>
                <TableCell>₹{transaction.amount.toFixed(2)}</TableCell>
                <TableCell>
                  {transaction.isRecurring ? (
                    <Badge variant="secondary">
                      {formatRecurringFrequency(transaction.recurringFrequency)}
                    </Badge>
                  ) : (
                    <span>-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(transaction)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(transaction._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

const MonthlyExpensesChart = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="amount" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

const ExportTransactionsButton = ({ transactions }) => {
  const handleExport = () => {
    const csv = exportToCSV(transactions, [
      { key: 'date', label: 'Date' },
      { key: 'description', label: 'Description' },
      { key: 'category', label: 'Category' },
      { key: 'amount', label: 'Amount' },
      { key: 'isRecurring', label: 'Recurring' },
      { key: 'recurringFrequency', label: 'Frequency' }
    ]);
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <Button onClick={handleExport} variant="outline">
      <Download className="mr-2 h-4 w-4" />
      Export Transactions
    </Button>
  );
};

const FixCategoriesButton = () => {
  const [isFixing, setIsFixing] = useState(false);
  const [error, setError] = useState(null);

  const handleFixCategories = async () => {
    setIsFixing(true);
    setError(null);

    try {
      const response = await fetch('/api/transactions/fix-categories', {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to fix categories');
      }

      window.location.reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={handleFixCategories}
        disabled={isFixing}
        variant="outline"
      >
        {isFixing ? 'Fixing...' : 'Fix Categories'}
      </Button>
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [dateRange, setDateRange] = useState({
    from: format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd')
  });
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [error, setError] = useState(null);

  const CATEGORIES = [
    'Food & Dining',
    'Transportation',
    'Housing',
    'Utilities',
    'Shopping',
    'Entertainment',
    'Healthcare',
    'Education',
    'Personal Care',
    'Other'
  ];

  const { data: transactionsData, error: transactionsError } = useSWR(
    '/api/transactions',
    fetcher
  );

  const { data: monthlyDataResponse } = useSWR(
    '/api/transactions/monthly',
    fetcher
  );

  useEffect(() => {
    if (transactionsData) {
      setTransactions(transactionsData);
    }
  }, [transactionsData]);

  useEffect(() => {
    if (monthlyDataResponse) {
      setMonthlyData(monthlyDataResponse);
    }
  }, [monthlyDataResponse]);

  useEffect(() => {
    let filtered = [...transactions];

    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    if (dateRange.from && dateRange.to) {
      const fromDate = new Date(dateRange.from);
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);

      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= fromDate && transactionDate <= toDate;
      });
    }

    setFilteredTransactions(filtered);
  }, [transactions, searchTerm, selectedCategory, dateRange]);

  const handleAddTransaction = async (formData) => {
    try {
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

      const newTransaction = await response.json();
      setTransactions(prev => [newTransaction, ...prev]);
      setIsFormOpen(false);
      setFormKey(prev => prev + 1);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateTransaction = async (formData) => {
    try {
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
      setTransactions(prev => 
        prev.map(t => t._id === updatedTransaction._id ? updatedTransaction : t)
      );
      setEditingTransaction(null);
      setIsFormOpen(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteTransaction = async (id) => {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete transaction');
      }

      setTransactions(prev => prev.filter(t => t._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = (formData) => {
    if (editingTransaction) {
      handleUpdateTransaction(formData);
    } else {
      handleAddTransaction(formData);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">
            Manage your financial transactions
          </p>
        </div>
        <div className="flex items-center gap-4">
          <FixCategoriesButton />
          <ExportTransactionsButton transactions={filteredTransactions} />
          <Button onClick={() => setIsFormOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <TransactionFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            dateRange={dateRange}
            setDateRange={setDateRange}
            categories={CATEGORIES}
          />
        </div>
        <div className="md:col-span-2 space-y-8">
          <MonthlyExpensesChart data={monthlyData} />
          <TransactionList
            transactions={filteredTransactions}
            onEdit={(transaction) => {
              setEditingTransaction(transaction);
              setIsFormOpen(true);
            }}
            onDelete={handleDeleteTransaction}
          />
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>
                {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
              </CardTitle>
            </CardHeader>
            <TransactionForm
              key={formKey}
              onSubmit={handleSubmit}
              initialData={editingTransaction}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingTransaction(null);
              }}
            />
          </Card>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
} 