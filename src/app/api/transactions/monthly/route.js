import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Transaction from '@/models/Transaction';

// GET monthly expenses for chart
export async function GET() {
  try {
    await dbConnect();
    
    // Check if there are any transactions
    const transactionCount = await Transaction.estimatedDocumentCount();
    if (transactionCount === 0) {
      return NextResponse.json([], { status: 200 });
    }
    
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
    const formattedData = monthlyData.map(item => {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return {
        name: `${monthNames[item._id.month - 1]} ${item._id.year}`,
        amount: parseFloat(item.total.toFixed(2))
      };
    });

    return NextResponse.json(formattedData, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/transactions/monthly:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
} 