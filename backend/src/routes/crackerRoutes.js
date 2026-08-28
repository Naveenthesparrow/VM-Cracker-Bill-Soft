import express from 'express';
import Cracker from '../models/crackerModel.js';

const router = express.Router();

// GET all crackers
router.get('/', async (req, res) => {
  try {
    const crackers = await Cracker.find().sort({ category: 1, productId: 1 });
    res.json(crackers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST new cracker
router.post('/', async (req, res) => {
  try {
    const newCracker = new Cracker(req.body);
    const savedCracker = await newCracker.save();
    res.status(201).json(savedCracker);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update cracker details (rate, stock, discounts)
router.put('/:id', async (req, res) => {
  try {
    const updatedCracker = await Cracker.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedCracker) {
      return res.status(404).json({ message: 'Cracker not found' });
    }
    res.json(updatedCracker);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE a cracker
router.delete('/:id', async (req, res) => {
  try {
    const deletedCracker = await Cracker.findByIdAndDelete(req.params.id);
    if (!deletedCracker) {
      return res.status(404).json({ message: 'Cracker not found' });
    }
    res.json({ message: 'Cracker deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
