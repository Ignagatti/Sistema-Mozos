const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function init() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS mozos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) UNIQUE NOT NULL,
        pin VARCHAR(20),
        rol VARCHAR(20) DEFAULT 'mozo',
        activo BOOLEAN DEFAULT true
      );
    `);
    
    await pool.query(`
      INSERT INTO mozos (nombre, pin, rol) 
      VALUES 
        ('Admin', '1234', 'admin'), 
        ('Mozo 1', '1111', 'mozo'), 
        ('Mozo 2', '2222', 'mozo') 
      ON CONFLICT (nombre) DO NOTHING;
    `);
    
    console.log('Tabla mozos creada y populada');
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

init();
