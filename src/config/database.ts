import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL no está definido en las variables de entorno.');
}

const sql = neon(process.env.DATABASE_URL);

export default sql;
