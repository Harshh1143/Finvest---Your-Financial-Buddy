import mongoose from 'mongoose';

const loanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  principal: { type: Number, required: true },
  remaining: { type: Number, required: true },
  rate: { type: Number, required: true },
  tenureMonths: { type: Number, required: true },
  startDate: { type: Date, required: true },
  nextPaymentDate: { type: Date },
  monthlyEMI: { type: Number, required: true },
  totalPaid: { type: Number, default: 0 },
  interestPaid: { type: Number, default: 0 }
}, { timestamps: true });

loanSchema.index({ userId: 1 });

export default mongoose.model('Loan', loanSchema);