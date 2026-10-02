// Diagnóstico exhaustivo del flujo de sincronización multi-PC
// Verifica: esquema de pos_entities, datos guardados, tipos de datos, formato de respuesta

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const CONN = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;

async function diagnose() {
    const { Client } = require('pg');
    const client = new Client({ connectionString: CONN });
    
    console.log('=== DIAGNÓSTICO DE SINCRONIZACIÓN MULTI-PC ===\n');
    
    try {
        await client.connect();
        console.log('✅ Conexión a Neon exitosa\n');

        // 1. Verificar que la tabla pos_entities existe y su esquema
        console.log('--- 1. ESQUEMA DE pos_entities ---');
        try {
            const schema = await client.query(`
                SELECT column_name, data_type, udt_name, is_nullable, column_default
                FROM information_schema.columns 
                WHERE table_name = 'pos_entities'
                ORDER BY ordinal_position;
            `);
            if (schema.rows.length === 0) {
                console.log('❌ LA TABLA pos_entities NO EXISTE!');
                return;
            }
            schema.rows.forEach(col => {
                console.log(`   ${col.column_name}: ${col.data_type} (${col.udt_name}) nullable=${col.is_nullable}`);
            });
            
            const dataCol = schema.rows.find(c => c.column_name === 'data');
            if (dataCol) {
                console.log(`\n   Columna 'data' tipo: ${dataCol.data_type} (${dataCol.udt_name})`);
                if (dataCol.udt_name === 'text' || dataCol.udt_name === 'varchar') {
                    console.log('   ⚠️  TIPO TEXT: pg devuelve STRING, el poll no puede hacer .id');
                } else if (dataCol.udt_name === 'jsonb' || dataCol.udt_name === 'json') {
                    console.log('   ✅ TIPO JSON/JSONB: pg devuelve objeto parsed');
                }
            }
        } catch (e) {
            console.log('❌ Error consultando esquema:', e.message);
        }

        // 2. Contar y listar entidades
        console.log('\n--- 2. CONTENIDO DE pos_entities ---');
        try {
            const count = await client.query('SELECT COUNT(*) as total FROM pos_entities;');
            console.log(`   Total de entidades: ${count.rows[0].total}`);
            
            const entities = await client.query('SELECT id, entity_type, pg_typeof(data) as data_pg_type, data, updated_at FROM pos_entities ORDER BY updated_at DESC LIMIT 10;');
            if (entities.rows.length === 0) {
                console.log('   ⚠️  NO HAY ENTIDADES EN LA TABLA');
            } else {
                entities.rows.forEach((row, i) => {
                    const dataType = typeof row.data;
                    const dataPreview = dataType === 'string' 
                        ? row.data.substring(0, 120) + '...'
                        : JSON.stringify(row.data).substring(0, 120) + '...';
                    console.log(`\n   [${i+1}] id=${row.id}`);
                    console.log(`       entity_type=${row.entity_type}`);
                    console.log(`       data_pg_type=${row.data_pg_type}`);
                    console.log(`       typeof data (JS)=${dataType}`);
                    console.log(`       updated_at=${row.updated_at}`);
                    console.log(`       data preview: ${dataPreview}`);
                    
                    if (dataType === 'object' && row.data !== null) {
                        console.log(`       data.id = ${row.data.id} ✅`);
                    } else if (dataType === 'string') {
                        console.log(`       data.id = undefined ❌ (es string, no objeto!)`);
                        try {
                            const parsed = JSON.parse(row.data);
                            console.log(`       JSON.parse(data).id = ${parsed.id} (necesita parse manual)`);
                        } catch(e) {
                            console.log(`       JSON.parse(data) FALLA: ${e.message}`);
                        }
                    }
                });
            }
        } catch (e) {
            console.log('❌ Error leyendo entidades:', e.message);
        }

        // 3. Simular exactamente loadCloudData como lo hace main.js
        console.log('\n--- 3. SIMULACIÓN DE loadCloudData ---');
        try {
            const entitiesRes = await client.query("SELECT id, entity_type, data FROM pos_entities;");
            const cloudEntities = entitiesRes.rows;

            console.log(`   cloudEntities.length = ${cloudEntities.length}`);
            console.log(`   Boolean(cloudEntities) = ${!!cloudEntities}`);
            
            if (cloudEntities.length > 0) {
                const first = cloudEntities[0];
                console.log(`\n   Primer entity:`);
                console.log(`     typeof first.data = ${typeof first.data}`);
                console.log(`     first.entity_type = ${first.entity_type}`);
                if (typeof first.data === 'object') {
                    console.log(`     first.data.id = ${first.data.id}`);
                    console.log(`     ✅ Poll PUEDE hacer .id`);
                } else {
                    console.log(`     ❌ Poll NO PUEDE hacer .id (tipo ${typeof first.data})`);
                    console.log(`     🔧 FIX: parsear JSON en loadCloudData o cambiar columna a jsonb`);
                }
            }
            
            // Simular pollCloudState merge
            console.log('\n--- 4. SIMULACIÓN DE pollCloudState ---');
            const loadedTables = [];
            const loadedBarOrders = [];
            cloudEntities.forEach(entity => {
                if (entity.entity_type === 'table') loadedTables.push(entity.data);
                else if (entity.entity_type === 'barOrder') loadedBarOrders.push(entity.data);
            });
            console.log(`   loadedTables.length = ${loadedTables.length}`);
            console.log(`   loadedBarOrders.length = ${loadedBarOrders.length}`);
            
            if (loadedTables.length > 0) {
                const t = loadedTables[0];
                console.log(`\n   Primera mesa:`);
                console.log(`     typeof = ${typeof t}`);
                console.log(`     .id = ${t && t.id}`);
                console.log(`     .number = ${t && t.number}`);
                
                if (typeof t === 'string') {
                    console.log('\n   ❌❌❌ BUG CONFIRMADO: data es STRING!');
                    console.log('   cloudTable.id es undefined → NUNCA mergea');
                } else if (typeof t === 'object' && t && t.id) {
                    console.log('\n   ✅ data es objeto con .id accesible - merge debería funcionar');
                }
            }
            
            if (loadedBarOrders.length > 0) {
                const b = loadedBarOrders[0];
                console.log(`\n   Primer barOrder:`);
                console.log(`     typeof = ${typeof b}`);
                console.log(`     .id = ${b && b.id}`);
                console.log(`     .clientName = ${b && b.clientName}`);
                
                if (typeof b === 'string') {
                    console.log('\n   ❌❌❌ BUG CONFIRMADO: barOrder data es STRING!');
                }
            }
        } catch (e) {
            console.log('   Error:', e.message);
        }

        // 5. Verificar constraints
        console.log('\n--- 5. CONSTRAINTS ---');
        try {
            const constraints = await client.query(`
                SELECT constraint_name, constraint_type 
                FROM information_schema.table_constraints 
                WHERE table_name = 'pos_entities';
            `);
            constraints.rows.forEach(c => {
                console.log(`   ${c.constraint_name}: ${c.constraint_type}`);
            });
        } catch (e) {
            console.log('   Error:', e.message);
        }

    } catch (err) {
        console.error('❌ Error de conexión:', err.message);
    } finally {
        await client.end().catch(() => {});
    }
}

diagnose();
