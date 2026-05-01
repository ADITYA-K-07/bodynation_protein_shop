import bcrypt from 'bcryptjs';
import express from 'express';
import jwt from 'jsonwebtoken';

import { requireAdmin } from '../middleware/auth.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

const router = express.Router();

function toProductPayload(body = {}) {
  return {
    id: String(body.id || '').trim(),
    slug: String(body.slug || '').trim(),
    brand: String(body.brand || '').trim(),
    name: String(body.name || '').trim(),
    shortName: String(body.shortName || '').trim(),
    category: String(body.category || '').trim(),
    goal: String(body.goal || '').trim(),
    color: String(body.color || '').trim(),
    image: String(body.image || '').trim(),
    heroImage: String(body.heroImage || body.image || '').trim(),
    ratingAverage: Number(body.ratingAverage || 0),
    ratingCount: Number(body.ratingCount || 0),
    badges: Array.isArray(body.badges) ? body.badges.map((item) => String(item).trim()).filter(Boolean) : [],
    description: String(body.description || '').trim(),
    highlights: Array.isArray(body.highlights)
      ? body.highlights.map((item) => String(item).trim()).filter(Boolean)
      : [],
    nutritionFacts: Array.isArray(body.nutritionFacts)
      ? body.nutritionFacts.map((item) => String(item).trim()).filter(Boolean)
      : [],
    variants: Array.isArray(body.variants)
      ? body.variants
          .map((variant) => ({
            id: String(variant?.id || '').trim(),
            flavour: String(variant?.flavour || '').trim(),
            size: String(variant?.size || '').trim(),
            price: Number(variant?.price || 0),
            mrp: Number(variant?.mrp || 0),
            stock: Number(variant?.stock || 0),
          }))
          .filter((variant) => variant.id && variant.flavour && variant.size)
      : [],
    labReportUrl: String(body.labReportUrl || '#').trim(),
    isActive: typeof body.isActive === 'boolean' ? body.isActive : true,
  };
}

function isValidProductPayload(payload) {
  return Boolean(
    payload.id &&
      payload.slug &&
      payload.brand &&
      payload.name &&
      payload.shortName &&
      payload.category &&
      payload.goal &&
      payload.color &&
      payload.image &&
      payload.heroImage &&
      payload.description &&
      Array.isArray(payload.variants) &&
      payload.variants.length > 0,
  );
}

async function passwordMatches(inputPassword, configuredPassword) {
  if (!configuredPassword) {
    return false;
  }

  if (configuredPassword.startsWith('$2')) {
    return bcrypt.compare(inputPassword, configuredPassword);
  }

  return inputPassword === configuredPassword;
}

router.post('/login', async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  const configuredEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const configuredPassword = String(process.env.ADMIN_PASSWORD || '');

  const isValid =
    email &&
    password &&
    email === configuredEmail &&
    (await passwordMatches(password, configuredPassword));

  if (!isValid) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });
});

router.use(requireAdmin);

router.get('/stats', async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [totalOrders, revenueResult, pendingFulfillments, todayOrders] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$total' },
          },
        },
      ]),
      Order.countDocuments({ fulfilled: false }),
      Order.countDocuments({ createdAt: { $gte: startOfToday } }),
    ]);

    res.json({
      totalOrders,
      totalRevenue: revenueResult[0]?.totalRevenue || 0,
      pendingFulfillments,
      todayOrders,
    });
  } catch (error) {
    console.error('Failed to fetch admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});

router.get('/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: 1 }).lean();
    res.json(products);
  } catch (error) {
    console.error('Failed to fetch admin products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.post('/products', async (req, res) => {
  try {
    const payload = toProductPayload(req.body);

    if (!isValidProductPayload(payload)) {
      res.status(400).json({ error: 'Invalid product payload' });
      return;
    }

    const product = await Product.create(payload);
    res.status(201).json(product);
  } catch (error) {
    console.error('Failed to create product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

router.put('/products/:id', async (req, res) => {
  try {
    const payload = toProductPayload(req.body);

    if (!isValidProductPayload(payload)) {
      res.status(400).json({ error: 'Invalid product payload' });
      return;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json(product);
  } catch (error) {
    console.error('Failed to update product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json({ ok: true });
  } catch (error) {
    console.error('Failed to delete product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

router.patch('/products/:id/active', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    product.isActive = typeof req.body?.isActive === 'boolean' ? req.body.isActive : !product.isActive;
    await product.save();

    res.json(product);
  } catch (error) {
    console.error('Failed to toggle product active state:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

router.patch('/products/:id/stock', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const explicitStock = req.body?.stock;
    const nextStockValue =
      Number.isFinite(Number(explicitStock))
        ? Math.max(0, Number(explicitStock))
        : product.variants.every((variant) => variant.stock === 0)
          ? 1
          : 0;

    product.variants = product.variants.map((variant) => ({
      id: variant.id,
      flavour: variant.flavour,
      size: variant.size,
      price: variant.price,
      mrp: variant.mrp,
      stock: nextStockValue,
    }));

    await product.save();
    res.json(product);
  } catch (error) {
    console.error('Failed to update product stock:', error);
    res.status(500).json({ error: 'Failed to update product stock' });
  }
});

router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).lean();
    res.json(orders);
  } catch (error) {
    console.error('Failed to fetch admin orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.patch('/orders/:id/fulfill', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    const fulfilled = typeof req.body?.fulfilled === 'boolean' ? req.body.fulfilled : !order.fulfilled;
    order.fulfilled = fulfilled;
    order.fulfilledAt = fulfilled ? new Date() : null;
    await order.save();

    res.json(order);
  } catch (error) {
    console.error('Failed to update order fulfillment:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

export default router;
