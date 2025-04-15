import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Transaction from '@/models/Transaction';

// POST: Fix transactions with missing category field
export async function POST(request) {
  try {
    await dbConnect();
    
    // Get the request body if an ID is provided
    const body = await request.json().catch(() => ({}));
    const specificId = body.id;
    
    let filter = {};
    
    // If ID is provided, only fix that specific transaction
    if (specificId) {
      filter._id = specificId;
    } else {
      // Otherwise find all transactions without a category
      filter = { 
        $or: [
          { category: { $exists: false } },
          { category: null },
          { category: '' }
        ]
      };
    }
    
    // Find the transactions to fix
    const transactionsToFix = await Transaction.find(filter);
    
    if (transactionsToFix.length === 0) {
      return NextResponse.json({ 
        message: specificId 
          ? `Transaction with ID ${specificId} not found or already has a category` 
          : 'No transactions found that need fixing' 
      });
    }
    
    // Update each transaction
    const updates = [];
    for (const transaction of transactionsToFix) {
      // Attempt to determine a category based on description
      let suggestedCategory = 'Other';
      const desc = transaction.description.toLowerCase();
      
      if (desc.includes('food') || desc.includes('grocery') || desc.includes('meal')) {
        suggestedCategory = 'Food';
      } else if (desc.includes('rent') || desc.includes('house') || desc.includes('home')) {
        suggestedCategory = 'Housing';
      } else if (desc.includes('bus') || desc.includes('train') || desc.includes('car') || 
                desc.includes('transport') || desc.includes('gas') || desc.includes('fuel')) {
        suggestedCategory = 'Transport';
      }
      
      // Update the transaction
      const updated = await Transaction.findByIdAndUpdate(
        transaction._id,
        { category: suggestedCategory },
        { new: true }
      );
      
      updates.push({
        id: transaction._id,
        description: transaction.description,
        oldCategory: transaction.category || 'none',
        newCategory: updated.category
      });
    }
    
    return NextResponse.json({
      message: `Fixed ${updates.length} transaction(s)`,
      updates
    });
  } catch (error) {
    console.error('Error fixing transactions:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal Server Error',
      stack: error.stack 
    }, { status: 500 });
  }
}

// GET: Check for transactions that need fixing
export async function GET() {
  try {
    await dbConnect();
    
    // Count transactions with missing categories
    const count = await Transaction.countDocuments({
      $or: [
        { category: { $exists: false } },
        { category: null },
        { category: '' }
      ]
    });
    
    return NextResponse.json({
      transactionsToFix: count,
      message: `Found ${count} transaction(s) that need category fixes`
    });
  } catch (error) {
    console.error('Error checking transactions:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal Server Error' 
    }, { status: 500 });
  }
} 