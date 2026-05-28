import { Router, Response } from 'express';
import pool from '../db';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/sync', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { items } = req.body;
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    if (items && Array.isArray(items)) {
      for (const item of items) {
        const existing = await pool.query(
          'SELECT id FROM cart_items WHERE user_id=$1 AND product_id=$2 AND size=$3',
          [req.user.id, item.product_id, item.size || 'M']
        );
        if (existing.rows.length > 0) {
          await pool.query(
            'UPDATE cart_items SET quantity=$1 WHERE id=$2',
            [item.quantity, existing.rows[0].id]
          );
        } else {
          await pool.query(
            'INSERT INTO cart_items (user_id, product_id, quantity, size) VALUES ($1,$2,$3,$4)',
            [req.user.id, item.product_id, item.quantity, item.size || 'M']
          );
        }
      }
    }
    const result = await pool.query(
      `SELECT ci.*, p.name, p.price, p.image_url, p.stock, p.sizes
       FROM cart_items ci JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = $1`,
      [req.user!.id]
    );
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    const result = await pool.query(
      `SELECT ci.*, p.name, p.price, p.image_url, p.stock, p.sizes
       FROM cart_items ci JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = $1`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;