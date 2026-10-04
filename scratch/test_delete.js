const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

pool.query('DELETE FROM pedidos_barra WHERE id = $1', ['bar-201'])
  .then(res => {
    console.log('Deleted rows:', res.rowCount);
  })
  .catch(err => {
    console.error('Error:', err);
  })
  .finally(() => {
    pool.end();
  });
