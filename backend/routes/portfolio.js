import express from 'express';
import PortfolioAsset from '../models/PortfolioAsset.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/error.js';

const router = express.Router();

router.use(authenticate);

// Get all portfolio assets
router.get('/', asyncHandler(async (req, res, next) => {
  const assets = await PortfolioAsset.find({ userId: req.userId });
  res.json(assets);
}));

// Add portfolio asset
router.post('/', asyncHandler(async (req, res, next) => {
  const { name, symbol, assetType, currentPrice, quantity, purchasePrice, purchaseDate } = req.body;
  
  if (!name || !symbol || !assetType || currentPrice === undefined || quantity === undefined || purchasePrice === undefined || !purchaseDate) {
    return next(new AppError('Please provide all required fields: name, symbol, assetType, currentPrice, quantity, purchasePrice, purchaseDate', 400));
  }

  const totalValue = quantity * currentPrice;
  const totalCost = quantity * purchasePrice;
  const unrealizedPL = totalValue - totalCost;
  const unrealizedPLPercent = totalCost > 0 ? (unrealizedPL / totalCost) * 100 : 0;

  const asset = new PortfolioAsset({
    userId: req.userId,
    name,
    symbol,
    assetType,
    currentPrice,
    quantity,
    purchasePrice,
    purchaseDate: new Date(purchaseDate),
    totalValue,
    totalCost,
    unrealizedPL,
    unrealizedPLPercent
  });
  
  await asset.save();
  res.status(201).json(asset);
}));

// Delete portfolio asset
router.delete('/:id', asyncHandler(async (req, res, next) => {
  const asset = await PortfolioAsset.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!asset) {
    return next(new AppError('Asset not found', 404));
  }
  res.json({ success: true });
}));

// Update asset price
router.patch('/:id/price', asyncHandler(async (req, res, next) => {
  const { currentPrice } = req.body;
  
  if (currentPrice === undefined || currentPrice < 0) {
    return next(new AppError('Please provide a valid asset price', 400));
  }

  const asset = await PortfolioAsset.findOne({ _id: req.params.id, userId: req.userId });
  if (!asset) {
    return next(new AppError('Asset not found', 404));
  }

  asset.totalValue = asset.quantity * currentPrice;
  asset.unrealizedPL = asset.totalValue - asset.totalCost;
  asset.unrealizedPLPercent = asset.totalCost > 0 ? (asset.unrealizedPL / asset.totalCost) * 100 : 0;
  asset.currentPrice = currentPrice;
  
  await asset.save();
  res.json(asset);
}));

export default router;