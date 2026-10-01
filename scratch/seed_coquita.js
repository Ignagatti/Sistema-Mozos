const { Client } = require('pg');
const connectionString = 'postgresql://neondb_owner:npg_IDfWvs28wpNB@ep-royal-breeze-b5v5b7vx-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';

async function seedCoquita() {
  const client = new Client({ connectionString });
  await client.connect();
  const maxIdRes = await client.query('SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM productos;');
  const nextId = maxIdRes.rows[0].next_id;
  await client.query(
    `INSERT INTO productos (id, nombre, categoria, precio, stock_actual, activo)
     VALUES ($1, 'Coquita', 'Gaseosas y Saborizadas', 3000.00, 100, true)
     ON CONFLICT (LOWER(nombre)) DO UPDATE SET precio = 3000.00, activo = true;`,
    [nextId]
  );
  console.log('Coquita successfully inserted into productos table in Neon DB!');
  const check = await client.query("SELECT * FROM productos WHERE nombre ILIKE '%coquita%';");
  console.log(check.rows);
  await client.end();
}

seedCoquita().catch(console.error);
