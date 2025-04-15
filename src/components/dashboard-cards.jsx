'use client';

import { ArrowUpRight, ArrowDownRight, CreditCard, Wallet, TrendingUp, DollarSign, Target } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function DashboardCards({ totalSpent, transactions }) {
  if (!transactions || transactions.length === 0) {
    return null;
  }

  // Calculate statistics
  const avgTransaction = totalSpent / transactions.length;
  
  // Find largest transaction
  const largestTransaction = [...transactions].sort((a, b) => b.amount - a.amount)[0];
  
  // Calculate spending by category
  const categorySpending = transactions.reduce((acc, t) => {
    const category = t.category || 'Other';
    acc[category] = (acc[category] || 0) + t.amount;
    return acc;
  }, {});
  
  // Find top category
  const topCategory = Object.entries(categorySpending)
    .sort(([, a], [, b]) => b - a)[0];
  
  // Calculate this month's data
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });
  
  const thisMonthTotal = thisMonthTransactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Transaction</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{avgTransaction.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            From {transactions.length} transactions
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Largest Transaction</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{largestTransaction?.amount.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground truncate max-w-32">
            {largestTransaction?.description}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Category</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{topCategory?.[0]}</div>
          <p className="text-xs text-muted-foreground">
            ₹{topCategory?.[1].toFixed(2)}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Month</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{thisMonthTotal.toFixed(2)}</div>
          <div className="flex items-center pt-1">
            <Badge variant="outline" className="text-xs">
              {thisMonthTransactions.length} transactions
            </Badge>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">All Time Total</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{totalSpent.toFixed(2)}</div>
          <div className="flex items-center pt-1">
            <Badge variant="outline" className="text-xs">
              {transactions.length} transactions
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function DashboardAdminLink() {
  return (
    <div className="text-xs text-gray-400 mt-2 text-right">
      <a href="/direct-fix" className="hover:underline">Fix Data Issues</a>
    </div>
  );
} 