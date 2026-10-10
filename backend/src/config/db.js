const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT) || 11521,
  database: process.env.PG_DATABASE,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  ssl: {
    rejectUnauthorized: false
  }
});

// Bắt lỗi kết nối background của pool
pool.on('error', (err) => {
  console.error('Lỗi kết nối database ngoài ý muốn:', err.message);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};