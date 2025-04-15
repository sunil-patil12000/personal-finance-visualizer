import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Transaction from '@/models/Transaction';

// GET a single transaction
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    const transaction = await Transaction.findById(id);
    
    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }
    
    return NextResponse.json(transaction, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT (update) a transaction
export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    const data = await request.json();
    
    // Debug logging to see what category is being sent
    console.log('Transaction update data:', {
      id,
      category: data.category,
      fullData: data
    });
    
    // Ensure category is not empty when provided
    if (data.hasOwnProperty('category') && !data.category) {
      return NextResponse.json({ 
        error: 'Category cannot be empty. Please select a valid category.' 
      }, { status: 400 });
    }
    
    const transaction = await Transaction.findByIdAndUpdate(
      id,
      data,
      { new: true, runValidators: true }
    );
    
    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }
    
    return NextResponse.json(transaction, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// DELETE a transaction
export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    
    const transaction = await Transaction.findByIdAndDelete(id);
    
    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Transaction deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 