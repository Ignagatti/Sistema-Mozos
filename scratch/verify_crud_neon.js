const { Client } = require('pg');
const connectionString = 'postgresql://neondb_owner:npg_IDfWvs28wpNB@ep-royal-breeze-b5v5b7vx-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';

async function verifyCRUD() {
  const client = new Client({ connectionString });
  await client.connect();

  console.log('--- 1. Testing UPSERT (Add/Modify) ---');
  const maxIdRes = await client.query('SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM productos;');
  const nextId = maxIdRes.rows[0].next_id;
  const testName = 'BebidaPruebaCRUD';

  await client.query(
    `INSERT INTO productos (id, nombre, categoria, precio, stock_actual, activo)
     VALUES ($1, $2, 'Gaseosas y Saborizadas', 4500.00, 100, true)
     ON CONFLICT (LOWER(nombre)) DO UPDATE SET precio = 4500.00, activo = true;`,
    [nextId, testName]
  );

  const check1 = await client.query('SELECT id, nombre, categoria, precio, activo FROM productos WHERE LOWER(nombre) = LOWER($1);', [testName]);
  console.log('Result after UPSERT:', check1.rows);

  console.log('--- 2. Testing Delete (Deactivate) ---');
  await client.query('UPDATE productos SET activo = false WHERE LOWER(nombre) = LOWER($1);', [testName]);
  const check2 = await client.query('SELECT id, nombre, categoria, precio, activo FROM productos WHERE LOWER(nombre) = LOWER($1);', [testName]);
  console.log('Result after DELETE:', check2.rows);

  // Limpiar producto de prueba
  await client.query('DELETE FROM productos WHERE LOWER(nombre) = LOWER($1);', [testName]);
  console.log('--- CRUD Verification Finished Successfully! ---');

  await client.end();
}

verifyCRUD().catch(console.error);
