import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Budget from '@/models/Budget';
import Transaction from '@/models/Transaction';

// GET budget vs. actual comparison for a given month
export async function GET(request) {
  try {
    await dbConnect();
    
    // Get the month query param
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    
    if (!month) {
      return NextResponse.json({ error: 'Month parameter is required (format: YYYY-MM)' }, { status: 400 });
    }
    
    try {
      // Parse the month to get year and month number
      const [year, monthNum] = month.split('-').map(num => parseInt(num));
      if (isNaN(year) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
        return NextResponse.json({ error: 'Invalid month format. Use YYYY-MM with valid month number (1-12)' }, { status: 400 });
      }
      
      // Get all budgets for the month
      const budgets = await Budget.find({ month });
      
      // If no budgets, return empty array
      if (budgets.length === 0) {
        return NextResponse.json([], { status: 200 });
      }
      
      // Calculate actual spending for each category in the given month
      const startDate = new Date(year, monthNum - 1, 1);
      const endDate = new Date(year, monthNum, 0); // Last day of the month
      
      const actualSpending = await Transaction.aggregate([
        {
          $match: {
            date: {
              $gte: startDate,
              $lte: endDate
            }
          }
        },
        {
          $group: {
            _id: '$category',
            actual: { $sum: '$amount' }
          }
        }
      ]);
      
      // Convert to a map for easier lookup
      const actualByCategory = {};
      actualSpending.forEach(item => {
        actualByCategory[item._id] = item.actual;
      });
      
      // Combine budget and actual data
      const comparisonData = budgets.map(budget => {
        const actual = actualByCategory[budget.category] || 0;
        const remaining = budget.budget - actual;
        const percentage = budget.budget > 0 ? (actual / budget.budget) * 100 : 0;
        
        return {
          category: budget.category,
          budget: budget.budget,
          actual,
          remaining,
          percentage: parseFloat(percentage.toFixed(2)),
          status: percentage > 100 ? 'over' : 'under'
        };
      });
      
      // Check for categories with spending but no budget
      const budgetCategories = new Set(budgets.map(b => b.category));
      const unbudgetedSpending = [];
      
      Object.keys(actualByCategory).forEach(category => {
        if (!budgetCategories.has(category)) {
          unbudgetedSpending.push({
            category,
            budget: 0,
            actual: actualByCategory[category],
            remaining: -actualByCategory[category],
            percentage: Infinity,
            status: 'unbudgeted'
          });
        }
      });
      
      // Combine both and sort by category
      const result = [...comparisonData, ...unbudgetedSpending].sort((a, b) => 
        a.category.localeCompare(b.category)
      );
      
      return NextResponse.json(result, { status: 200 });
    } catch (error) {
      console.error('Error processing budget comparison data:', error);
      return NextResponse.json({ error: 'Error processing budget data' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in GET /api/budgets/comparison:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
} 