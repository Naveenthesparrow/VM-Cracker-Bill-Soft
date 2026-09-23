import express from 'express';
import Order from '../models/orderModel.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth middleware to all order routes
router.use(protect);

// GET all orders for the logged-in shop
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find({ shopId: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST new order (Bill saving)
router.post('/', async (req, res) => {
  try {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const date = String(today.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${date}`;

    // Get count of orders saved today to create a sequence suffix
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const lastOrder = await Order.findOne({
      shopId: req.user._id,
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    }).sort({ createdAt: -1 });

    let nextSequence = 1;
    if (lastOrder && lastOrder.billNumber) {
      const parts = lastOrder.billNumber.split('-');
      const lastSeq = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastSeq)) {
        nextSequence = lastSeq + 1;
      }
    }

    const shopPrefix = req.user._id.toString().slice(-4).toUpperCase();
    const billNumber = `INV-${shopPrefix}-${dateStr}-${String(nextSequence).padStart(3, '0')}`;

    const newOrder = new Order({
      ...req.body,
      shopId: req.user._id,
      billNumber
    });

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update an order
router.put('/:id', async (req, res) => {
  try {
    const { customerName, customerPhone, items, grossTotal, discountTotal, netTotal, paymentMode } = req.body;
    const updatedOrder = await Order.findOneAndUpdate(
      { _id: req.params.id, shopId: req.user._id },
      { customerName, customerPhone, items, grossTotal, discountTotal, netTotal, paymentMode },
      { new: true, runValidators: true }
    );
    if (!updatedOrder) {
      return res.status(404).json({ message: 'Bill not found' });
    }
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE an order
router.delete('/:id', async (req, res) => {
  try {
    const deletedOrder = await Order.findOneAndDelete({ _id: req.params.id, shopId: req.user._id });
    if (!deletedOrder) {
      return res.status(404).json({ message: 'Bill not found' });
    }
    res.json({ message: 'Bill deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
