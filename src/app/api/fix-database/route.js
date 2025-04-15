import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Transaction from '@/models/Transaction';

// POST to fix transactions with missing categories
export async function POST() {
  try {
    await dbConnect();
    
    // Find all transactions with missing categories
    const transactionsToFix = await Transaction.find({
      $or: [
        { category: { $exists: false } },
        { category: null },
        { category: '' }
      ]
    });
    
    console.log(`Found ${transactionsToFix.length} transactions to fix`);
    
    const updates = [];
    for (const transaction of transactionsToFix) {
      // Determine category based on description
      let suggestedCategory = 'Other';
      const desc = (transaction.description || '').toLowerCase();
      
      if (desc.includes('food') || desc.includes('meal') || desc.includes('grocery') || desc.includes('restaurant')) {
        suggestedCategory = 'Food';
      } else if (desc.includes('rent') || desc.includes('home') || desc.includes('house')) {
        suggestedCategory = 'Housing';
      } else if (desc.includes('bus') || desc.includes('train') || desc.includes('transport')) {
        suggestedCategory = 'Transport';
      }
      
      console.log(`Fixing transaction ${transaction._id}: "${transaction.description}" => ${suggestedCategory}`);
      
      // Update the transaction
      await Transaction.updateOne(
        { _id: transaction._id },
        { $set: { category: suggestedCategory } }
      );
      
      updates.push({
        id: transaction._id.toString(),
        description: transaction.description,
        newCategory: suggestedCategory
      });
    }
    
    return NextResponse.json({
      success: true,
      message: `Fixed ${updates.length} transactions`,
      updates
    });
  } catch (error) {
    console.error('Error fixing transactions:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// GET to check for transactions that need fixing
export async function GET() {
  try {
    await dbConnect();
    
    // Find transactions with missing categories
    const count = await Transaction.countDocuments({
      $or: [
        { category: { $exists: false } },
        { category: null },
        { category: '' }
      ]
    });
    
    const specificId = '67fde37670aea655591d582b';
    const specificTransaction = await Transaction.findById(specificId);
    
    return NextResponse.json({
      count,
      specificTransaction: specificTransaction ? {
        id: specificTransaction._id.toString(),
        description: specificTransaction.description,
        hasCategory: specificTransaction.category ? true : false,
        category: specificTransaction.category || 'missing'
      } : null
    });
  } catch (error) {
    console.error('Error checking transactions:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
} 