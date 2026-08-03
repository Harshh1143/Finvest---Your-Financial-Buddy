import express from 'express';
import PortfolioAsset from '../models/PortfolioAsset.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

// Get all portfolio assets
router.get('/', async (req, res) => {
  try {
    const assets = await PortfolioAsset.find({ userId: req.userId });
    res.json(assets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add portfolio asset
router.post('/', async (req, res) => {
  try {
    const { name, symbol, assetType, currentPrice, quantity, purchasePrice, purchaseDate } = req.body;
    
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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete portfolio asset
router.delete('/:id', async (req, res) => {
  try {
    await PortfolioAsset.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update asset price
router.patch('/:id/price', async (req, res) => {
  try {
    const { currentPrice } = req.body;
    const asset = await PortfolioAsset.findOne({ _id: req.params.id, userId: req.userId });
    
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    asset.totalValue = asset.quantity * currentPrice;
    asset.unrealizedPL = asset.totalValue - asset.totalCost;
    asset.unrealizedPLPercent = asset.totalCost > 0 ? (asset.unrealizedPL / asset.totalCost) * 100 : 0;
    asset.currentPrice = currentPrice;
    
    await asset.save();
    res.json(asset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;