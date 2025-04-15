import { NextResponse } from 'next/server';

// GET all available transaction categories
export async function GET() {
  try {
    // Categories are hardcoded for consistency
    const categories = [
      { id: 'food', name: 'Food' },
      { id: 'transport', name: 'Transport' },
      { id: 'entertainment', name: 'Entertainment' },
      { id: 'utilities', name: 'Utilities' },
      { id: 'housing', name: 'Housing' },
      { id: 'healthcare', name: 'Healthcare' },
      { id: 'education', name: 'Education' },
      { id: 'other', name: 'Other' }
    ];
    
    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/categories:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
} 