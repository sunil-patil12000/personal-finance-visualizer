import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Transaction from '@/models/Transaction';

// GET all transactions
export async function GET() {
  try {
    await dbConnect();
    const transactions = await Transaction.find({}).sort({ date: -1 });
    return NextResponse.json(transactions, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/transactions:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// POST a new transaction
export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();
    
    // Debug logging to see what category is being sent
    console.log('Creating new transaction:', {
      category: data.category,
      fullData: data
    });
    
    // Ensure category is not empty
    if (!data.category) {
      return NextResponse.json({ 
        error: 'Category is required. Please select a valid category.' 
      }, { status: 400 });
    }
    
    const transaction = await Transaction.create(data);
    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/transactions:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 400 });
  }
}

// GET transactions grouped by month for chart
export async function getMonthlyExpenses() {
  try {
    await dbConnect();
    const monthlyData = await Transaction.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" }
          },
          total: { $sum: "$amount" }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    // Format the data for the chart
    return monthlyData.map(item => ({
      month: `${item._id.year}-${item._id.month}`,
      amount: item.total
    }));
  } catch (error) {
    console.error('Error getting monthly expenses:', error);
    return [];
  }
} 