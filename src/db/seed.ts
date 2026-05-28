import pool from './index';
import bcrypt from 'bcryptjs';

async function seed() {
  const client = await pool.connect();
  try {
    const users = [
      { email: 'admin@shop.local', password: await bcrypt.hash('admin', 10), name: 'Admin', role: 'admin' },
      { email: 'alice@example.com', password: await bcrypt.hash('password', 10), name: 'Alice Johnson', role: 'user', address: '123 Main St, Portland', phone: '+1-555-0101' },
      { email: 'bob@example.com', password: await bcrypt.hash('password', 10), name: 'Bob Williams', role: 'user', address: '456 Oak Ave, Seattle', phone: '+1-555-0202' },
    ];

    for (const u of users) {
      await client.query(
        'INSERT INTO users (email, password, name, role, address, phone) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (email) DO NOTHING',
        [u.email, u.password, u.name, u.role, u.address || '', u.phone || '']
      );
    }

    const categories = [
      { name: 'T-Shirts', slug: 't-shirts' },
      { name: 'Posters', slug: 'posters' },
      { name: 'Accessories', slug: 'accessories' },
    ];
    for (const c of categories) {
      await client.query(
        'INSERT INTO categories (name, slug) VALUES ($1,$2) ON CONFLICT (slug) DO NOTHING',
        [c.name, c.slug]
      );
    }

    const products = [
      { name: 'Vibe Miner T-Shirt', description: 'Official Vibe Miner tee featuring the iconic pickaxe logo. Soft cotton, pre-shrunk.', price: 29.99, image_url: '/assets/tshirt_vibe_miner.png', category: 't-shirts', sizes: ['S','M','L','XL'], stock: 50 },
      { name: 'Pixel Heart T-Shirt', description: 'Retro 8-bit heart design for the pixel art lovers. Comfortable unisex fit.', price: 27.99, image_url: '/assets/tshirt_pixel_heart.png', category: 't-shirts', sizes: ['S','M','L','XL'], stock: 35 },
      { name: 'Synthwave Sunset T-Shirt', description: 'Neon-soaked synthwave grid design. Feel the retro-future vibes.', price: 32.99, image_url: '/assets/tshirt_synthwave.png', category: 't-shirts', sizes: ['S','M','L','XL','XXL'], stock: 40 },
      { name: 'Game Over T-Shirt', description: 'Classic arcade "Game Over" screen print. Nostalgia guaranteed.', price: 25.99, image_url: '/assets/tshirt_game_over.png', category: 't-shirts', sizes: ['S','M','L','XL'], stock: 60 },
      { name: 'Cyber Cat T-Shirt', description: 'A neon feline warrior from the cyberpunk future. Glow-in-the-dark ink.', price: 34.99, image_url: '/assets/tshirt_cyber_cat.png', category: 't-shirts', sizes: ['S','M','L','XL'], stock: 25 },
      { name: 'Loading Bar T-Shirt', description: 'Stuck at 99% loading. Relatable gamer humor on premium tri-blend fabric.', price: 26.99, image_url: '/assets/tshirt_loading_bar.png', category: 't-shirts', sizes: ['S','M','L','XL'], stock: 45 },
      { name: 'Retro Gamepad T-Shirt', description: 'Classic console controller blueprint. For the old-school gaming enthusiast.', price: 28.99, image_url: '/assets/tshirt_retro_gamepad.png', category: 't-shirts', sizes: ['S','M','L','XL','XXL'], stock: 30 },
      { name: 'Glitch Skull T-Shirt', description: 'Digital corruption meets dark aesthetics. Edgy glitch-art skull print.', price: 31.99, image_url: '/assets/tshirt_glitch_skull.png', category: 't-shirts', sizes: ['S','M','L','XL'], stock: 20 },
      { name: 'Space Invader T-Shirt', description: 'Alien invasion in retro pixel style. A tribute to the arcade classic.', price: 27.99, image_url: '/assets/tshirt_space_invader.png', category: 't-shirts', sizes: ['S','M','L','XL'], stock: 55 },
      { name: 'D20 Dice T-Shirt', description: 'Natural 20 critical hit! Tabletop RPG inspired design for dungeon masters.', price: 29.99, image_url: '/assets/tshirt_d20_dice.png', category: 't-shirts', sizes: ['S','M','L','XL'], stock: 40 },
      { name: 'Vibe Miner Poster', description: 'High-quality A2 poster of the Vibe Miner cover art. Matte finish, 200gsm.', price: 14.99, image_url: '/assets/tshirt_vibe_miner.png', category: 'posters', sizes: ['one-size'], stock: 100 },
      { name: 'Pixel Dungeon Poster', description: 'Dungeon crawler scene in glorious pixel art. A2 size, satin finish.', price: 14.99, image_url: '/assets/tshirt_pixel_heart.png', category: 'posters', sizes: ['one-size'], stock: 80 },
      { name: 'Cyberpunk Cityscape Poster', description: 'Neon-drenched skyline concept art. A1 size, 250gsm premium paper.', price: 19.99, image_url: '/assets/tshirt_synthwave.png', category: 'posters', sizes: ['one-size'], stock: 60 },
      { name: 'Indie Game Keychain Set', description: 'Set of 3 enamel keychains featuring iconic indie game symbols.', price: 12.99, image_url: '/assets/tshirt_game_over.png', category: 'accessories', sizes: ['one-size'], stock: 200 },
      { name: 'Gamer Sticker Pack', description: '20 vinyl waterproof stickers with indie game artwork. Weatherproof.', price: 8.99, image_url: '/assets/tshirt_cyber_cat.png', category: 'accessories', sizes: ['one-size'], stock: 300 },
    ];

    for (const p of products) {
      await client.query(
        `INSERT INTO products (name, description, price, image_url, category_id, sizes, stock)
         VALUES ($1,$2,$3,$4,(SELECT id FROM categories WHERE slug=$5),$6,$7)
         ON CONFLICT DO NOTHING`,
        [p.name, p.description, p.price, p.image_url, p.category, p.sizes, p.stock]
      );
    }

    const orderStatuses = ['new', 'confirmed', 'shipped', 'delivered'];
    for (let i = 0; i < 5; i++) {
      const userId = (i % 2) + 2;
      const productId = (i % 15) + 1;
      const productRes = await client.query('SELECT price FROM products WHERE id=$1', [productId]);
      const price = productRes.rows[0]?.price || 29.99;
      const total = Math.round((price * (i + 1)) * 100) / 100;

      const orderRes = await client.query(
        `INSERT INTO orders (user_id, name, address, phone, payment_method, status, total)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
        [userId, `Test User ${i+1}`, `${100+i} Test St`, `+1-555-000${i}`, 'card', orderStatuses[i % 4], total]
      );
      const orderId = orderRes.rows[0].id;

      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price, size) VALUES ($1,$2,$3,$4,$5)',
        [orderId, productId, i + 1, price, 'M']
      );
    }

    console.log('Seed completed successfully.');
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});