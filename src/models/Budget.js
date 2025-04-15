import mongoose from 'mongoose';


const BudgetSchema = new mongoose.Schema({
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: ['Food', 'Transport', 'Entertainment', 'Utilities', 'Housing', 'Healthcare', 'Education', 'Other'],
  },
  month: {
    type: String,
    required: [true, 'Please provide a month in YYYY-MM format'],
    match: [/^\d{4}-\d{2}$/, 'Month must be in format YYYY-MM']
  },
  budget: {
    type: Number,
    required: [true, 'Please provide a budget amount'],
    min: [0.01, 'Budget must be greater than 0']
  }
}, {
  timestamps: true
});

// Create a compound index on category and month to ensure uniqueness
BudgetSchema.index({ category: 1, month: 1 }, { unique: true });

// Check if model already exists to prevent overwriting during hot reloads
export default mongoose.models.Budget || mongoose.model('Budget', BudgetSchema); 