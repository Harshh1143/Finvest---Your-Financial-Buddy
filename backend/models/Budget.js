import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  monthlyBudget: { type: Number, required: true }
}, { timestamps: true });

const categoryBudgetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  monthlyBudget: { type: Number, required: true }
}, { timestamps: true });

categoryBudgetSchema.index({ userId: 1, category: 1 }, { unique: true });

export const Budget = mongoose.model('Budget', budgetSchema);
export const CategoryBudget = mongoose.model('CategoryBudget', categoryBudgetSchema);