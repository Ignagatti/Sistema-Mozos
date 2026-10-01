const { Client } = require('pg');
const connectionString = 'postgresql://neondb_owner:npg_IDfWvs28wpNB@ep-royal-breeze-b5v5b7vx-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';

async function checkCoquita() {
  const client = new Client({ connectionString });
  await client.connect();
  const res = await client.query("SELECT * FROM productos WHERE nombre ILIKE '%coquita%';");
  console.log('Coquita in productos table:', res.rows);

  const snapRes = await client.query("SELECT snapshot_data FROM app_state_snapshots WHERE id = 'current';");
  if (snapRes.rows.length > 0 && snapRes.rows[0].snapshot_data && snapRes.rows[0].snapshot_data.prices) {
    const bevs = snapRes.rows[0].snapshot_data.prices.beverages || [];
    console.log('Coquita in snapshot_data:', bevs.filter(b => b.name.toLowerCase().includes('coquita')));
  } else {
    console.log('No snapshot_data found');
  }

  await client.end();
}

checkCoquita().catch(console.error);
