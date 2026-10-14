import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE || 'purchase_management',
});

async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()');

    console.log('Conexão com PostgreSQL estabelecida!');
    console.log('Horário do banco:', result.rows[0].now);
  } catch (error) {
    console.error('Erro ao conectar ao PostgreSQL:', error);
  } finally {
    await pool.end();
  }
}

testConnection();