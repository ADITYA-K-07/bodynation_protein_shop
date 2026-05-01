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
const allowedOrigins = new Set(['http://localhost:5173', 'http://localhost:5174']);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
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

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    await seedProductsIfEmpty();

    const port = Number(process.env.PORT) || 4000;
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('MongoDB error:', error);
    process.exit(1);
  }
}

startServer();
