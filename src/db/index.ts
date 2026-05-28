import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@192.168.1.178:5432/app',
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export default pool;