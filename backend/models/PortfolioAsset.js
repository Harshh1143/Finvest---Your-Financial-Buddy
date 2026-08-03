import mongoose from 'mongoose';

const portfolioAssetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  symbol: { type: String, required: true },
  assetType: { type: String, required: true },
  currentPrice: { type: Number, required: true },
  quantity: { type: Number, required: true },
  purchasePrice: { type: Number, required: true },
  purchaseDate: { type: Date, required: true },
  totalValue: { type: Number, required: true },
  totalCost: { type: Number, required: true },
  unrealizedPL: { type: Number, required: true },
  unrealizedPLPercent: { type: Number, required: true }
}, { timestamps: true });

portfolioAssetSchema.index({ userId: 1, assetType: 1 });

export default mongoose.model('PortfolioAsset', portfolioAssetSchema);