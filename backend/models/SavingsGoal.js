import mongoose from 'mongoose';

const savingsGoalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  targetAmount: { type: Number, required: true },
  currentAmount: { type: Number, default: 0 },
  targetDate: { type: Date, required: true },
  category: { type: String }
}, { timestamps: true });

savingsGoalSchema.index({ userId: 1 });

export default mongoose.model('SavingsGoal', savingsGoalSchema);