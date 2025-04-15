import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Budget from '@/models/Budget';

// GET a single budget
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    const budget = await Budget.findById(id);
    
    if (!budget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
    }
    
    return NextResponse.json(budget, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT (update) a budget
export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    const data = await request.json();
    
    const budget = await Budget.findByIdAndUpdate(
      id,
      data,
      { new: true, runValidators: true }
    );
    
    if (!budget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
    }
    
    return NextResponse.json(budget, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// DELETE a budget
export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    
    const budget = await Budget.findByIdAndDelete(id);
    
    if (!budget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Budget deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 