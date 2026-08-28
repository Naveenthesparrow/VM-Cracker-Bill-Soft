import express from 'express';
import Settings from '../models/settingsModel.js';

const router = express.Router();

// GET shop settings (always returns a single settings document)
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      // Create default settings if not exists
      settings = await Settings.create({
        shopName: 'VM Crackers',
        shopAddress: '4/210 Bypass Road, Sivakasi East, Tamil Nadu - 626189',
        shopPhone: '98431 23456',
        globalDiscountPercentage: 90,
        upiId: 'vmcrackers@okaxis'
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
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings(req.body);
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
