import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Transaction from '@/models/Transaction';

// GET transactions grouped by category for pie chart
export async function GET() {
  try {
    await dbConnect();
    
    // Check if there are any transactions
    const transactionCount = await Transaction.estimatedDocumentCount();
    if (transactionCount === 0) {
      return NextResponse.json([], { status: 200 });
    }
    
    const categoryData = await Transaction.aggregate([
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" }
        }
      },
      {
        $sort: { "total": -1 }
      }
    ]);

    // Format the data for the chart
    const formattedData = categoryData.map(item => ({
      name: item._id || 'Other',
      value: parseFloat(item.total.toFixed(2))
    }));

    return NextResponse.json(formattedData, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/transactions/categories:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
} 