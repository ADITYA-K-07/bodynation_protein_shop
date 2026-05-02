import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';

import adminRouter from './routes/admin.js';
import ordersRouter from './routes/orders.js';
import paymentRouter from './routes/payment.js';
import productsRouter from './routes/products.js';
import { seedProductsIfEmpty } from './utils/seedProducts.js';

dotenv.config();

const app = express();
const localhostOrigins = ['http://localhost:5173', 'http://localhost:5174'];
const vercelOrigins = [process.env.VERCEL_PROJECT_PRODUCTION_URL, process.env.VERCEL_URL]
  .filter(Boolean)
  .map((value) => (value.startsWith('http') ? value : `https://${value}`));
const allowedOrigins = new Set(
  [process.env.APP_ORIGIN, process.env.FRONTEND_ORIGIN, process.env.ADMIN_ORIGIN]
    .concat(localhostOrigins, vercelOrigins)
    .concat((process.env.ALLOWED_ORIGINS || '').split(','))
    .map((value) => String(value || '').trim().replace(/\/$/, ''))
    .filter(Boolean),
);

let connectPromise = null;
let bootstrapPromise = null;
let hasSeededProducts = false;

function isAllowedOrigin(origin) {
  if (!origin) {
    return true;
  }

  const normalizedOrigin = String(origin).trim().replace(/\/$/, '');
  if (allowedOrigins.has(normalizedOrigin)) {
    return true;
  }

  try {
    return new URL(normalizedOrigin).hostname.endsWith('.vercel.app');
  } catch {
    return false;
  }
}

export async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (mongoose.connection.readyState === 2 && connectPromise) {
    return connectPromise;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured');
  }

  connectPromise =
    connectPromise ||
    mongoose.connect(process.env.MONGODB_URI).catch((error) => {
      connectPromise = null;
      throw error;
    });

  await connectPromise;
  return mongoose.connection;
}

export async function prepareApp() {
  bootstrapPromise =
    bootstrapPromise ||
    (async () => {
      await connectToDatabase();

      if (!hasSeededProducts) {
        await seedProductsIfEmpty();
        hasSeededProducts = true;
      }
    })().catch((error) => {
      bootstrapPromise = null;
      throw error;
    });

  return bootstrapPromise;
}

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Not allowed by CORS'));
    },
  }),
);

app.use(express.json({ limit: '2mb' }));

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/admin', adminRouter);

app.use((err, req, res, next) => {
  if (err?.message === 'Not allowed by CORS') {
    res.status(403).json({ error: 'Origin not allowed' });
    return;
  }

  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
