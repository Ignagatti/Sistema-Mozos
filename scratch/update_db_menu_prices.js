const { Client } = require('pg');
const connectionString = 'postgresql://neondb_owner:npg_IDfWvs28wpNB@ep-royal-breeze-b5v5b7vx-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';

async function updatePrices() {
  const client = new Client({ connectionString });
  await client.connect();
  await client.query("UPDATE productos SET precio = 5000.00 WHERE nombre ILIKE '%menú%' OR nombre ILIKE '%menu%';");
  await client.query("UPDATE productos SET precio = 1500.00 WHERE nombre ILIKE '%postre%';");
  await client.query("UPDATE productos SET precio = 1200.00 WHERE nombre ILIKE '%empanada%';");
  
  const check = await client.query("SELECT id, nombre, categoria, precio FROM productos WHERE nombre ILIKE '%menu%' OR nombre ILIKE '%postre%' OR nombre ILIKE '%empanada%';");
  console.log('Updated DB Prices:', check.rows);
  await client.end();
}

updatePrices().catch(console.error);
