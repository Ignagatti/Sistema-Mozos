const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs').promises; // Usamos fs.promises para operaciones asíncronas

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'icono.ico'),
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
