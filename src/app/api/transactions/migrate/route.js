import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Transaction from '@/models/Transaction';

// POST: Migrate transactions with missing categories
export async function POST() {
  try {
    await dbConnect();
    
    // Find all transactions with null or empty categories
    const transactionsToFix = await Transaction.find({
      $or: [
        { category: null },
        { category: '' },
        { category: { $exists: false } }
      ]
    });
    
    console.log(`Found ${transactionsToFix.length} transactions to migrate`);
    
    // Update each transaction
    let updatedCount = 0;
    for (const transaction of transactionsToFix) {
      // Attempt to determine a category based on description
      // This is a simple example - you could make this more sophisticated
      let suggestedCategory = 'Other';
      const desc = transaction.description.toLowerCase();
      
      if (desc.includes('food') || desc.includes('grocery') || desc.includes('restaurant') || desc.includes('meal')) {
        suggestedCategory = 'Food';
      } else if (desc.includes('rent') || desc.includes('mortgage') || desc.includes('home')) {
        suggestedCategory = 'Housing';
      } else if (desc.includes('bus') || desc.includes('train') || desc.includes('taxi') || desc.includes('uber') || desc.includes('gas') || desc.includes('fuel')) {
        suggestedCategory = 'Transport';
      }
      
      // Update the transaction
      await Transaction.findByIdAndUpdate(
        transaction._id,
        { category: suggestedCategory },
        { new: true }
      );
      updatedCount++;
    }
    
    return NextResponse.json({
      message: `Successfully migrated ${updatedCount} transactions`,
      transactionsFixed: updatedCount
    }, { status: 200 });
  } catch (error) {
    console.error('Error in transaction migration:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// GET: Just return the count of transactions that would be migrated
export async function GET() {
  try {
    await dbConnect();
    
    // Count transactions with null or empty categories
    const count = await Transaction.countDocuments({
      $or: [
        { category: null },
        { category: '' },
        { category: { $exists: false } }
      ]
    });
    
    return NextResponse.json({
      transactionsToFix: count,
      message: `Found ${count} transactions that need category migration`
    }, { status: 200 });
  } catch (error) {
    console.error('Error checking transactions to migrate:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
} 