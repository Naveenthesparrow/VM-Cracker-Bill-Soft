import express from 'express';
import Settings from '../models/settingsModel.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth middleware to all settings routes
router.use(protect);

// GET shop settings
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne({ shopId: req.user._id });
    if (!settings) {
      // Create default settings if not exists
      settings = await Settings.create({
        shopId: req.user._id,
        shopName: `${req.user.name}'s Shop`,
        shopAddress: 'Sivakasi to Vembakottai Main Road, Vanamoorthilingapuram',
        shopPhone: '+91 63698 09391, +91 89402 23892',
        globalDiscountPercentage: 90,
        upiId: '@upi'
      });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT update shop settings
router.put('/', async (req, res) => {
  try {
    let settings = await Settings.findOne({ shopId: req.user._id });
    if (!settings) {
      settings = new Settings({ ...req.body, shopId: req.user._id });
    } else {
      Object.assign(settings, req.body);
    }
    const savedSettings = await settings.save();
    res.json(savedSettings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
