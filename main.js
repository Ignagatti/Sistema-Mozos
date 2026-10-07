const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises; // Usamos fs.promises para operaciones asíncronas

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'assets', 'logo_rivera.ico'),
    webPreferences: {
      // --- ESTAS LÍNEAS SON LA CLAVE DE LA CORRECCIÓN ---
      preload: path.join(__dirname, 'preload.js'), // Carga el script puente
      contextIsolation: true, // Aísla el frontend del backend por seguridad
      nodeIntegration: false, // Deshabilita la integración de Node en el frontend
      sandbox: true
    }
  });

  win.maximize(); // Abre la ventana maximizada
  win.loadFile('index.html');
  // win.webContents.openDevTools(); // Descomentar para depurar
}

app.whenReady().then(() => {
  // Define la ruta del archivo de respaldo en una carpeta segura de la app
  const backupPath = path.join(app.getPath('userData'), 'backup.json');

  // Maneja la solicitud para guardar el respaldo
  ipcMain.on('save-backup', async (event, data) => {
    try {
      await fs.writeFile(backupPath, data, 'utf-8');
    } catch (err) {
      console.error('Failed to save backup:', err);
    }
  });

  // Maneja la solicitud para cargar el respaldo
  ipcMain.handle('load-backup', async () => {
    try {
      // Lee el archivo de respaldo y lo devuelve al frontend
      return await fs.readFile(backupPath, 'utf-8');
    } catch (err) {
      // Si el archivo no existe, es normal. Simplemente no devuelve nada.
      if (err.code === 'ENOENT') {
        return null;
      }
      console.error('Failed to load backup:', err);
      return null;
    }
  });

  // Maneja la generación y descarga directa de PDF sin diálogo de impresora
  ipcMain.handle('save-pdf', async (event, { html, defaultFilename }) => {
    let pdfWin = null;
    try {
      const mainWindow = BrowserWindow.fromWebContents(event.sender);
      const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
        title: 'Descargar Reporte de Ventas (PDF)',
        defaultPath: defaultFilename || `Reporte-Ventas-${new Date().toISOString().slice(0, 10)}.pdf`,
        filters: [
          { name: 'Documento PDF (*.pdf)', extensions: ['pdf'] }
        ]
      });

      if (canceled || !filePath) {
        return { success: false, canceled: true };
      }

      // Crear ventana en segundo plano para renderizar el documento
      pdfWin = new BrowserWindow({
        show: false,
        width: 1000,
        height: 1400,
        webPreferences: {
          sandbox: true
        }
      });

      await pdfWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

      // Breve pausa para asegurar renderizado completo de CSS y SVG
      await new Promise(resolve => setTimeout(resolve, 350));

      const pdfBuffer = await pdfWin.webContents.printToPDF({
        pageSize: 'A4',
        printBackground: true,
        margins: {
          top: 0.3,
          bottom: 0.3,
          left: 0.3,
          right: 0.3
        }
      });

      await fs.writeFile(filePath, pdfBuffer);

      return { success: true, filePath };
    } catch (err) {
      console.error('Error al generar PDF:', err);
      return { success: false, error: err.message };
    } finally {
      if (pdfWin) {
        pdfWin.destroy();
      }
    }
  });

  // Abrir ubicación del archivo descargado
  ipcMain.on('show-item-in-folder', (event, filePath) => {
    if (filePath) {
      shell.showItemInFolder(filePath);
    }
  });
  
  // Maneja la apertura de enlaces externos (como WhatsApp)
  ipcMain.on('open-external-link', (event, url) => {
    // Valida que el enlace sea seguro antes de abrirlo
    if (url.startsWith('whatsapp://')) {
      shell.openExternal(url);
    }
  });

// Configuración y conexión segura a Neon Cloud PostgreSQL
const fsSync = require('fs');
const dotenv = require('dotenv');

// Se busca el archivo .env primero en el directorio de recursos de la app instalada (resourcesPath) y luego en el directorio local de desarrollo
const envPathProd = path.join(process.resourcesPath, '.env');
const envPathDev = path.join(__dirname, '.env');

if (fsSync.existsSync(envPathProd)) {
  dotenv.config({ path: envPathProd });
} else if (fsSync.existsSync(envPathDev)) {
  dotenv.config({ path: envPathDev });
} else {
  dotenv.config();
}

let dbPool = null;
try {
  const { Pool } = require('pg');
  // Se obtiene la cadena de conexión exclusivamente desde las variables de entorno (.env)
  const NEON_CONN_STRING = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

  if (NEON_CONN_STRING) {
    dbPool = new Pool({
      connectionString: NEON_CONN_STRING,
      max: 15,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000
    });
  } else {
    console.warn('ADVERTENCIA: No se encontró la URL de conexión a Neon DB en variables de entorno (consulte el archivo .env).');
  }
} catch (err) {
  console.error('Error inicializando pool de PostgreSQL:', err);
}

// Maneja la carga de datos desde Neon Cloud DB
ipcMain.handle('load-cloud-data', async () => {
  if (!dbPool) return { success: false, error: 'Database not initialized' };
  try {
    const snapshotRes = await dbPool.query("SELECT snapshot_data FROM app_state_snapshots WHERE id = 'current' LIMIT 1;");
    const snapshot = snapshotRes.rows.length > 0 ? snapshotRes.rows[0].snapshot_data : null;

    const prodsRes = await dbPool.query("SELECT nombre, categoria, precio FROM productos WHERE activo = true;");
    const dbProducts = prodsRes.rows;



    const mesasRes = await dbPool.query("SELECT * FROM mesas;");
    const pedidosRes = await dbPool.query("SELECT * FROM pedidos_barra;");
    
    const cloudEntities = [];
    mesasRes.rows.forEach(r => {
      const entityData = {
          id: r.id,
          number: r.table_number ? r.table_number.toString() : (r.custom_name || ''),
          custom_name: r.custom_name,
          x: r.x, y: r.y, width: r.width, height: r.height,
          order: r.order_data || {},
          isPaid: r.is_paid || false,
          paidAmount: Number(r.paid_amount) || 0,
          tipAmount: Number(r.tip_amount) || 0,
          inUseBy: r.device_id || null
      };
      cloudEntities.push({ id: r.id, entity_type: 'table', data: entityData });
    });

    pedidosRes.rows.forEach(r => {
      const entityData = {
          id: r.id,
          clientName: r.client_name,
          order: r.order_data || {},
          isPaid: r.is_paid || false,
          paidAmount: Number(r.paid_amount) || 0,
          tipAmount: Number(r.tip_amount) || 0,
          inUseBy: r.device_id || null
      };
      cloudEntities.push({ id: r.id, entity_type: 'barOrder', data: entityData });
    });

    return { success: true, snapshot, dbProducts, cloudEntities };
  } catch (err) {
    console.error('Error cargando datos de Neon DB:', err);
    return { success: false, error: err.message };
  }
});

// Maneja la sincronización de estado completo a Neon Cloud DB
ipcMain.handle('sync-cloud-state', async (event, snapshot) => {
  if (!snapshot) return { success: false, error: 'No snapshot provided' };
  try {
    const snapshotJson = JSON.stringify(snapshot);

    // 1. Guardar/Actualizar snapshot global en app_state_snapshots
    await dbPool.query(
      `INSERT INTO app_state_snapshots (id, snapshot_data, version, device_id, updated_at)
       VALUES ('current', $1, 1, 'pos-main', CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO UPDATE SET snapshot_data = EXCLUDED.snapshot_data, updated_at = CURRENT_TIMESTAMP;`,
      [snapshotJson]
    );

    // 2. Guardar precios globales en restaurant_prices
    if (snapshot.prices) {
      await dbPool.query(
        `INSERT INTO restaurant_prices (id, prices_data, device_id, updated_at)
         VALUES ('default', $1, 'pos-main', CURRENT_TIMESTAMP)
         ON CONFLICT (id) DO UPDATE SET prices_data = EXCLUDED.prices_data, updated_at = CURRENT_TIMESTAMP;`,
        [JSON.stringify(snapshot.prices)]
      );
    }

    return { success: true };
  } catch (err) {
    console.error('Error sincronizando estado en Neon DB:', err);
    return { success: false, error: err.message };
  }
});

// Maneja la actualización de precio o creación de producto en Neon PostgreSQL
ipcMain.handle('update-product-price', async (event, { productName, newPrice, category }) => {
  if (!productName) return { success: false, error: 'Product name required' };
  try {
    const catName = category || 'Bebidas';
    const pPrice = Number(newPrice) || 0;

    await dbPool.query(
      `INSERT INTO productos (nombre, categoria, precio, stock_actual, activo)
       VALUES ($1, $2, $3, 100, true)
       ON CONFLICT (LOWER(nombre)) DO UPDATE SET precio = EXCLUDED.precio, categoria = EXCLUDED.categoria, activo = true;`,
      [productName.trim(), catName, pPrice]
    );
    return { success: true };
  } catch (err) {
    console.error('Error actualizando precio en Neon DB:', err);
    return { success: false, error: err.message };
  }
});

// Maneja la eliminación de un producto en Neon PostgreSQL DB
ipcMain.handle('delete-product', async (event, { productName }) => {
  if (!productName) return { success: false, error: 'Product name required' };
  try {
    const pName = productName.trim();
    const cleanPizzaName = pName.toLowerCase().startsWith('pizza ') ? pName : `Pizza ${pName}`;

    const res = await dbPool.query(
      'DELETE FROM productos WHERE LOWER(nombre) = LOWER($1) OR LOWER(nombre) = LOWER($2);',
      [pName, cleanPizzaName]
    );
    console.log(`Producto '${pName}' eliminado de Neon DB (Filas afectadas: ${res.rowCount})`);
    return { success: true, count: res.rowCount };
  } catch (err) {
    console.error('Error eliminando producto de Neon DB:', err);
    return { success: false, error: err.message };
  }
});

// Maneja el Cierre de Caja General y cambio de jornada global en Neon DB
ipcMain.handle('close-global-shift', async () => {
  if (!dbPool) return { success: false, error: 'Database pool not initialized' };
  try {
    // 1. Resetear todas las mesas a su estado original (sin pedidos, is_paid=false)
    await dbPool.query(
      "UPDATE mesas SET order_data = '{}', is_paid = false, paid_amount = 0, tip_amount = 0, device_id = NULL, updated_at = CURRENT_TIMESTAMP;"
    );
    // 2. Limpiar todos los pedidos de barra
    await dbPool.query(
      "TRUNCATE TABLE pedidos_barra;"
    );
    // 3. Actualizar estado de jornada activa en caso de existir la tabla
    await dbPool.query(
      "UPDATE mesas_activas SET estado = 'cerrada', mozo_asignado = NULL, ultima_actualizacion = CURRENT_TIMESTAMP;"
    ).catch(err => console.log('Tabla opcional mesas_activas:', err.message));

    return { success: true };
  } catch (err) {
    console.error('Error cerrando jornada global en Neon DB:', err);
    return { success: false, error: err.message };
  }
});

// Maneja el guardado o actualización individual de mesas o pedidos de barra en Neon Cloud DB
ipcMain.handle('save-cloud-entity', async (event, { entity, type }) => {
  if (!entity || !entity.id || !type) return { success: false, error: 'Invalid entity data' };
  try {
    if (type === 'table') {
      await dbPool.query(
        `INSERT INTO mesas (id, table_number, custom_name, x, y, width, height, order_data, is_paid, paid_amount, tip_amount, device_id, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP)
         ON CONFLICT (id) DO UPDATE SET 
            table_number = EXCLUDED.table_number, custom_name = EXCLUDED.custom_name,
            x = EXCLUDED.x, y = EXCLUDED.y, width = EXCLUDED.width, height = EXCLUDED.height,
            order_data = EXCLUDED.order_data, is_paid = EXCLUDED.is_paid, 
            paid_amount = EXCLUDED.paid_amount, tip_amount = EXCLUDED.tip_amount, 
            device_id = EXCLUDED.device_id, updated_at = CURRENT_TIMESTAMP;`,
        [
          entity.id, 
          parseInt(entity.number) || null, 
          entity.number || '', 
          entity.x || 50, entity.y || 50, entity.width || 100, entity.height || 100,
          JSON.stringify(entity.order || {}),
          entity.isPaid || false,
          entity.paidAmount || 0,
          entity.tipAmount || 0,
          entity.inUseBy || null
        ]
      );
    } else if (type === 'barOrder') {
      await dbPool.query(
        `INSERT INTO pedidos_barra (id, client_name, order_data, is_paid, paid_amount, tip_amount, device_id, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
         ON CONFLICT (id) DO UPDATE SET 
            client_name = EXCLUDED.client_name, order_data = EXCLUDED.order_data, 
            is_paid = EXCLUDED.is_paid, paid_amount = EXCLUDED.paid_amount, 
            tip_amount = EXCLUDED.tip_amount, device_id = EXCLUDED.device_id, 
            updated_at = CURRENT_TIMESTAMP;`,
        [
          entity.id, 
          entity.clientName || '', 
          JSON.stringify(entity.order || {}),
          entity.isPaid || false,
          entity.paidAmount || 0,
          entity.tipAmount || 0,
          entity.inUseBy || null
        ]
      );
    }
    return { success: true };
  } catch (err) {
    console.error('Error guardando entidad en Neon DB:', err);
    return { success: false, error: err.message };
  }
});

// Maneja la eliminación de una entidad específica (mesa o pedido de barra) en Neon DB
ipcMain.handle('delete-cloud-entity', async (event, { id }) => {
  if (!id) return { success: false, error: 'Entity id required' };
  try {
    if (id.startsWith('table')) {
      await dbPool.query('DELETE FROM mesas WHERE id = $1;', [id]);
    } else {
      await dbPool.query('DELETE FROM pedidos_barra WHERE id = $1;', [id]);
    }
    return { success: true };
  } catch (err) {
    console.error('Error eliminando entidad en Neon DB:', err);
    return { success: false, error: err.message };
  }
});

// Maneja la limpieza general de todas las entidades en Neon DB
ipcMain.handle('clear-all-entities', async () => {
  try {
    await dbPool.query('TRUNCATE TABLE mesas;');
    await dbPool.query('TRUNCATE TABLE pedidos_barra;');
    return { success: true };
  } catch (err) {
    console.error('Error limpiando entidades en Neon DB:', err);
    return { success: false, error: err.message };
  }
});

  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
