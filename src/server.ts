import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

import { loggerMiddleware } from './middleware/logger';
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import cartRoutes from './routes/cart';
import orderRoutes from './routes/orders';
import adminRoutes from './routes/admin';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 80;

app.use(cors({
  origin: ['http://deepseek-shop.voimaxgm.online', 'http://192.168.1.126', 'http://localhost:5173'],
  credentials: true,
}));

app.use(express.json());
app.use(loggerMiddleware);

app.use('/assets', express.static(path.resolve(__dirname, '..', 'client', 'public', 'assets')));
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

const clientBuild = path.resolve(__dirname, '..', 'client', 'dist');
app.use(express.static(clientBuild));
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientBuild, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});