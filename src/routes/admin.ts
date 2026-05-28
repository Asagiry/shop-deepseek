import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import https from 'https';
import http from 'http';
import pool from '../db';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

const uploadsDir = path.resolve(__dirname, '..', '..', 'client', 'public', 'assets');
const upload = multer({ dest: path.resolve(__dirname, '..', '..', 'uploads') });

router.use(authenticate, requireAdmin);

async function downloadImage(url: string, destPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (response) => {
      if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        downloadImage(response.headers.location, destPath).then(resolve).catch(reject);
        return;
      }
      const fileStream = fs.createWriteStream(destPath);
      response.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
      fileStream.on('error', reject);
    }).on('error', reject);
  });
}

router.post('/products', async (req: Request, res: Response) => {
  try {
    const { name, description, price, category_id, sizes, stock, image_url } = req.body;
    if (!name || price === undefined || price === null) {
      res.status(400).json({ error: 'Name and price are required' });
      return;
    }

    let imagePath = '';
    if (image_url) {
      const filename = `upload_${Date.now()}.png`;
      const dest = path.join(uploadsDir, filename);
      try {
        await downloadImage(image_url, dest);
        imagePath = `/assets/${filename}`;
      } catch {
        imagePath = image_url;
      }
    }

    const result = await pool.query(
      `INSERT INTO products (name, description, price, image_url, category_id, sizes, stock)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [name, description || '', price, imagePath, category_id || null, sizes || [], stock || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/products/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, category_id, sizes, stock, image_url } = req.body;

    const existing = await pool.query('SELECT * FROM products WHERE id=$1', [id]);
    if (existing.rows.length === 0) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    let imagePath = existing.rows[0].image_url;
    if (image_url && image_url !== existing.rows[0].image_url) {
      const filename = `upload_${Date.now()}.png`;
      const dest = path.join(uploadsDir, filename);
      try {
        await downloadImage(image_url, dest);
        imagePath = `/assets/${filename}`;
      } catch {
        imagePath = image_url;
      }
    }

    const result = await pool.query(
      `UPDATE products SET name=$1, description=$2, price=$3, image_url=$4, category_id=$5, sizes=$6, stock=$7, updated_at=NOW()
       WHERE id=$8 RETURNING *`,
      [
        name !== undefined ? name : existing.rows[0].name,
        description !== undefined ? description : existing.rows[0].description,
        price !== undefined ? price : existing.rows[0].price,
        imagePath,
        category_id !== undefined ? category_id : existing.rows[0].category_id,
        sizes !== undefined ? sizes : existing.rows[0].sizes,
        stock !== undefined ? stock : existing.rows[0].stock,
        id
      ]
    );
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/products/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM products WHERE id=$1', [id]);
    res.json({ message: 'Product deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/orders', async (_req: Request, res: Response) => {
  try {
    const orders = await pool.query(
      'SELECT * FROM orders ORDER BY created_at DESC'
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

router.put('/orders/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['new', 'confirmed', 'shipped', 'delivered'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
      return;
    }
    const result = await pool.query(
      'UPDATE orders SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *',
      [status, id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;