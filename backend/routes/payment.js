import crypto from 'crypto';
import express from 'express';
import Razorpay from 'razorpay';

import Order from '../models/Order.js';
import { createOrderId, isValidOrderPayload, normalizeOrderInput } from '../utils/orderPayload.js';

const router = express.Router();

function getRazorpayClient() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return null;
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

router.post('/create-order', async (req, res) => {
  try {
    const razorpay = getRazorpayClient();

    if (!razorpay) {
      res.status(500).json({ error: 'Razorpay credentials are not configured' });
      return;
    }

    const amount = Number(req.body?.amount);
    const currency = String(req.body?.currency || 'INR').trim().toUpperCase();
    const receipt = String(req.body?.receipt || `receipt_${Date.now()}`).trim();

    if (!Number.isFinite(amount) || amount <= 0) {
      res.status(400).json({ error: 'Amount must be a positive number' });
      return;
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency,
      receipt,
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Failed to create Razorpay order:', error);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
});

router.post('/verify', async (req, res) => {
  try {
    if (!process.env.RAZORPAY_KEY_SECRET) {
      res.status(500).json({ error: 'Razorpay secret is not configured' });
      return;
    }

    const razorpayOrderId = String(req.body?.razorpay_order_id || '').trim();
    const razorpayPaymentId = String(req.body?.razorpay_payment_id || '').trim();
    const razorpaySignature = String(req.body?.razorpay_signature || '').trim();
    const normalizedOrder = normalizeOrderInput(req.body?.order);

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      res.status(400).json({ error: 'Missing payment verification fields' });
      return;
    }

    if (!isValidOrderPayload(normalizedOrder)) {
      res.status(400).json({ error: 'Invalid order payload' });
      return;
    }

    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (generatedSignature !== razorpaySignature) {
      res.status(400).json({ error: 'Invalid payment signature' });
      return;
    }

    const existingOrder = await Order.findOne({
      'payment.razorpay_payment_id': razorpayPaymentId,
    });

    if (existingOrder) {
      res.json({ orderId: existingOrder.orderId });
      return;
    }

    const order = await Order.create({
      ...normalizedOrder,
      orderId: createOrderId(),
      payment: {
        status: 'paid',
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: razorpaySignature,
      },
      fulfilled: false,
      fulfilledAt: null,
    });

    res.status(201).json({ orderId: order.orderId });
  } catch (error) {
    console.error('Failed to verify payment:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

export default router;
