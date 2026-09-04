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

  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
