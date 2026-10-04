const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.query(`
  SELECT table_name, column_name, data_type 
  FROM information_schema.columns 
  WHERE table_name IN ('mesas_activas', 'detalles_comanda', 'pedidos_barra', 'mesas');
`).then(res => {
  console.table(res.rows);
  pool.end();
}).catch(console.error);
