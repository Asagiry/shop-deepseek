import { Router, Response } from 'express';
import pool from '../db';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    const { name, address, phone, paymentMethod, items } = req.body;
    if (!name || !address || !phone || !items || !items.length) {
      res.status(400).json({ error: 'Name, address, phone, and items are required' });
      return;
    }

    await client.query('BEGIN');

    let total = 0;
    for (const item of items) {
      const prod = await client.query('SELECT * FROM products WHERE id=$1 FOR UPDATE', [item.product_id]);
      if (prod.rows.length === 0) {
        await client.query('ROLLBACK');
        res.status(404).json({ error: `Product ${item.product_id} not found` });
        return;
      }
      const product = prod.rows[0];
      if (product.stock < item.quantity) {
        await client.query('ROLLBACK');
        res.status(400).json({ error: `Insufficient stock for "${product.name}"` });
        return;
      }
      total += parseFloat(product.price) * item.quantity;
    }

    const orderResult = await client.query(
      `INSERT INTO orders (user_id, name, address, phone, payment_method, status, total)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [req.user.id, name, address, phone, paymentMethod || 'card', 'new', Math.round(total * 100) / 100]
    );
    const order = orderResult.rows[0];

    for (const item of items) {
      const prod = await client.query('SELECT price, stock FROM products WHERE id=$1', [item.product_id]);
      const product = prod.rows[0];
      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price, size) VALUES ($1,$2,$3,$4,$5)',
        [order.id, item.product_id, item.quantity, product.price, item.size || 'M']
      );
      await client.query(
        'UPDATE products SET stock = stock - $1 WHERE id=$2',
        [item.quantity, item.product_id]
      );
    }

    await client.query('DELETE FROM cart_items WHERE user_id=$1', [req.user.id]);
    await client.query('COMMIT');

    res.status(201).json({ order });
  } catch (err: any) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

router.get('/history', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    const orders = await pool.query(
      'SELECT * FROM orders WHERE user_id=$1 ORDER BY created_at DESC',
      [req.user.id]
    );
    for (const order of orders.rows) {
      const items = await pool.query(
        `SELECT oi.*, p.name, p.image_url
         FROM order_items oi JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = $1`,
        [order.id]
      );
      order.items = items.rows;
    }
    res.json(orders.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;