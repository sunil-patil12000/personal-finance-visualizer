import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Budget from '@/models/Budget';

// GET budgets with optional month filter
export async function GET(request) {
  try {
    await dbConnect();
    
    // Get the month query param if it exists
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    
    let query = {};
    if (month) {
      query.month = month;
    }
    
    const budgets = await Budget.find(query).sort({ category: 1 });
    return NextResponse.json(budgets, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/budgets:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// POST a new budget
export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();
    
    // Check if budget for this category and month already exists
    const existingBudget = await Budget.findOne({
      category: data.category,
      month: data.month
    });
    
    if (existingBudget) {
      // Update existing budget
      existingBudget.budget = data.budget;
      await existingBudget.save();
      return NextResponse.json(existingBudget, { status: 200 });
    } else {
      // Create new budget
      const budget = await Budget.create(data);
      return NextResponse.json(budget, { status: 201 });
    }
  } catch (error) {
    console.error('Error in POST /api/budgets:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 400 });
  }
} 