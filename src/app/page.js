'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

// Import our new components
import { DashboardCards } from '@/components/dashboard-cards';
import { CategoryChart } from '@/components/category-chart';
import { RecentTransactions } from '@/components/recent-transactions';
import { BudgetAlerts } from '@/components/budget-alerts';
import { DashboardAdminLink } from '@/components/dashboard-cards';

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalSpent, setTotalSpent] = useState(0);
  const currentMonth = format(new Date(), 'yyyy-MM');

  // Fetch recent transactions
  const fetchRecentTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/transactions');
      
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      
      const data = await response.json();
      
      // Get the 5 most recent transactions
      const recentTransactions = data.slice(0, 5);
      setTransactions(recentTransactions);
      
      // Calculate total spent
      const total = data.reduce((sum, transaction) => sum + transaction.amount, 0);
      setTotalSpent(total);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
      setTotalSpent(0);
      setError('Error loading transactions data. Please check your database connection.');
      setLoading(false);
    }
  };

  // Fetch category data for pie chart
  const fetchCategoryData = async () => {
    try {
      const response = await fetch('/api/transactions/categories');
      
      if (!response.ok) {
        throw new Error('Failed to fetch category data');
      }
      
      const data = await response.json();
      setCategoryData(data);
    } catch (error) {
      console.error('Error fetching category data:', error);
      setCategoryData([]);
      // We don't set a global error here to avoid multiple error messages
    }
  };

  // Fetch budget comparison data
  const fetchComparisonData = async () => {
    try {
      const response = await fetch(`/api/budgets/comparison?month=${currentMonth}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch comparison data');
      }
      
      const data = await response.json();
      setComparisonData(data);
    } catch (error) {
      console.error('Error fetching comparison data:', error);
      setComparisonData([]);
      // We don't set a global error here to avoid multiple error messages
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchRecentTransactions();
        await fetchCategoryData();
        await fetchComparisonData();
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    };
    
    loadData();
  }, []);

  // Get over budget categories
  const getOverBudgetCategories = () => {
    if (!comparisonData || comparisonData.length === 0) {
      return [];
    }
    
    return comparisonData.filter(item => 
      item.status === 'over' && item.budget > 0
    );
  };

  const overBudgetCategories = getOverBudgetCategories();

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-lg font-medium text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Your financial overview and recent activity</p>
      </div>
      
      {error && (
        <div className="mb-6 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-800">
          {error}
        </div>
      )}
      
      {/* Budget Alerts */}
      <BudgetAlerts overBudgetCategories={overBudgetCategories} />
      
      {/* Stats Cards */}
      <div className="mt-6">
        <DashboardCards totalSpent={totalSpent} transactions={transactions} />
      </div>
      
      {/* Charts and Recent Transactions */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <CategoryChart data={categoryData} />
        </div>
        <div className="lg:col-span-3">
          <RecentTransactions transactions={transactions} />
        </div>
      </div>
      
      {/* Add the admin link */}
      <DashboardAdminLink />
    </div>
  );
}
