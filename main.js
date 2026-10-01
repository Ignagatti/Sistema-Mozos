const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises; // Usamos fs.promises para operaciones asíncronas

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    fullscreen: true,
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

require('dotenv').config();
const NEON_CONN_STRING = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || 'postgresql://neondb_owner:npg_IDfWvs28wpNB@ep-royal-breeze-b5v5b7vx-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=verify-full';

  // Maneja la carga de datos desde Neon Cloud DB
  ipcMain.handle('load-cloud-data', async () => {
    const { Client } = require('pg');
    const client = new Client({ connectionString: NEON_CONN_STRING });
    try {
      await client.connect();
      const snapshotRes = await client.query("SELECT snapshot_data FROM app_state_snapshots WHERE id = 'current' LIMIT 1;");
      const snapshot = snapshotRes.rows.length > 0 ? snapshotRes.rows[0].snapshot_data : null;

      const prodsRes = await client.query("SELECT nombre, categoria, precio FROM productos WHERE activo = true;");
      const dbProducts = prodsRes.rows;

      return { success: true, snapshot, dbProducts };
    } catch (err) {
      console.error('Error cargando datos de Neon DB:', err);
      return { success: false, error: err.message };
    } finally {
      await client.end().catch(() => {});
    }
  });

  // Maneja la sincronización de estado completo a Neon Cloud DB
  // NOTA: NO tocamos la tabla productos aquí. Los productos se manejan
  // individualmente con update-product-price y delete-product para evitar
  // que un producto borrado reaparezca al sincronizar.
  ipcMain.handle('sync-cloud-state', async (event, snapshot) => {
    if (!snapshot) return { success: false, error: 'No snapshot provided' };
    const { Client } = require('pg');
    const client = new Client({ connectionString: NEON_CONN_STRING });
    try {
      await client.connect();
      const snapshotJson = JSON.stringify(snapshot);

      // 1. Guardar/Actualizar snapshot global en app_state_snapshots
      await client.query(
        `INSERT INTO app_state_snapshots (id, snapshot_data, version, device_id, updated_at)
         VALUES ('current', $1, 1, 'pos-main', CURRENT_TIMESTAMP)
         ON CONFLICT (id) DO UPDATE SET snapshot_data = EXCLUDED.snapshot_data, updated_at = CURRENT_TIMESTAMP;`,
        [snapshotJson]
      );

      // 2. Guardar precios globales en restaurant_prices
      if (snapshot.prices) {
        await client.query(
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
    } finally {
      await client.end().catch(() => {});
    }
  });


  // Maneja la actualización de precio o creación de producto en Neon PostgreSQL
  ipcMain.handle('update-product-price', async (event, { productName, newPrice, category }) => {
    if (!productName) return { success: false, error: 'Product name required' };
    const { Client } = require('pg');
    const client = new Client({ connectionString: NEON_CONN_STRING });
    try {
      await client.connect();
      const catName = category || 'Bebidas';
      const pPrice = Number(newPrice) || 0;

      await client.query(
        `INSERT INTO productos (nombre, categoria, precio, stock_actual, activo)
         VALUES ($1, $2, $3, 100, true)
         ON CONFLICT (LOWER(nombre)) DO UPDATE SET precio = EXCLUDED.precio, categoria = EXCLUDED.categoria, activo = true;`,
        [productName.trim(), catName, pPrice]
      );
      return { success: true };
    } catch (err) {
      console.error('Error actualizando precio en Neon DB:', err);
      return { success: false, error: err.message };
    } finally {
      await client.end().catch(() => {});
    }
  });

  // Maneja la eliminación de un producto en Neon PostgreSQL DB
  ipcMain.handle('delete-product', async (event, { productName }) => {
    if (!productName) return { success: false, error: 'Product name required' };
    const { Client } = require('pg');
    const client = new Client({ connectionString: NEON_CONN_STRING });
    try {
      await client.connect();
      const pName = productName.trim();
      // Borrar por nombre exacto y también con prefijo "Pizza " para gustos de pizza
      const cleanPizzaName = pName.toLowerCase().startsWith('pizza ') ? pName : `Pizza ${pName}`;

      const res = await client.query(
        'DELETE FROM productos WHERE LOWER(nombre) = LOWER($1) OR LOWER(nombre) = LOWER($2);',
        [pName, cleanPizzaName]
      );
      console.log(`Producto '${pName}' eliminado de Neon DB (Filas afectadas: ${res.rowCount})`);
      return { success: true, count: res.rowCount };
    } catch (err) {
      console.error('Error eliminando producto de Neon DB:', err);
      return { success: false, error: err.message };
    } finally {
      await client.end().catch(() => {});
    }
  });


  // Maneja el Cierre de Caja General y cambio de jornada global en Neon DB
  ipcMain.handle('close-global-shift', async () => {
    const { Client } = require('pg');
    const connectionString = 'postgresql://neondb_owner:npg_IDfWvs28wpNB@ep-royal-breeze-b5v5b7vx-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';
    const client = new Client({ connectionString });
    try {
      await client.connect();
      await client.query(
        "UPDATE mesas_activas SET estado = 'cerrada', mozo_asignado = NULL, ultima_actualizacion = CURRENT_TIMESTAMP;"
      );
      return { success: true };
    } catch (err) {
      console.error('Error cerrando jornada global en Neon DB:', err);
      return { success: false, error: err.message };
    } finally {
      await client.end().catch(() => {});
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
