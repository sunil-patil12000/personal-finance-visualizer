import mongoose from 'mongoose';


const TransactionSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: [true, 'Please provide an amount'],
    min: [0.01, 'Amount must be greater than 0']
  },
  date: {
    type: Date,
    required: [true, 'Please provide a date'],
    default: Date.now
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: ['Food', 'Transport', 'Entertainment', 'Utilities', 'Housing', 'Healthcare', 'Education', 'Other']
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringFrequency: {
    type: String,
    enum: ['weekly', 'monthly', 'yearly', ''],
    default: ''
  }
}, {
  timestamps: true
});

// Check if model already exists to prevent overwriting during hot reloads
export default mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema); 