const { contextBridge, ipcRenderer } = require('electron');

// Expone una API segura al frontend (index.html) para interactuar con el backend (main.js)
contextBridge.exposeInMainWorld('electronAPI', {
  // Función para abrir WhatsApp
  openExternal: (url) => ipcRenderer.send('open-external-link', url),
  
  // Función para guardar el respaldo. Envía los datos al proceso principal.
  saveBackup: (data) => ipcRenderer.send('save-backup', data),
  
  // Función para cargar el respaldo. Pide los datos al proceso principal.
  loadBackup: () => ipcRenderer.invoke('load-backup'),

  // Función para guardar / descargar PDF del reporte
  savePDF: (data) => ipcRenderer.invoke('save-pdf', data),

  // Función para mostrar archivo descargado en el explorador de archivos
  showItemInFolder: (filePath) => ipcRenderer.send('show-item-in-folder', filePath)
});