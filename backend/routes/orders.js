import express from 'express';

import Order from '../models/Order.js';
import { createOrderId, isValidOrderPayload, normalizeOrderInput } from '../utils/orderPayload.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const normalizedOrder = normalizeOrderInput(req.body);

    if (!isValidOrderPayload(normalizedOrder)) {
      res.status(400).json({ error: 'Invalid order payload' });
      return;
    }

    const order = await Order.create({
      ...normalizedOrder,
      orderId: createOrderId(),
      payment: {
        status: 'pending',
        razorpay_order_id: null,
        razorpay_payment_id: null,
        razorpay_signature: null,
      },
      fulfilled: false,
      fulfilledAt: null,
    });

    res.status(201).json({
      orderId: order.orderId,
      payment: order.payment,
    });
  } catch (error) {
    console.error('Failed to create COD order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

export default router;
