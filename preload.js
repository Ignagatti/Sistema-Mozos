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
  showItemInFolder: (filePath) => ipcRenderer.send('show-item-in-folder', filePath),

  // Carga inicial y sync cloud con Neon PostgreSQL DB
  loadCloudData: () => ipcRenderer.invoke('load-cloud-data'),
  syncCloudState: (snapshot) => ipcRenderer.invoke('sync-cloud-state', snapshot),

  // Función para actualizar o eliminar precio de un producto en la BDD de Neon
  updateProductPrice: (data) => ipcRenderer.invoke('update-product-price', data),
  deleteProduct: (data) => ipcRenderer.invoke('delete-product', data),

  // Función para realizar el Cierre de Caja General y cambio de jornada global en Neon DB
  closeGlobalShift: () => ipcRenderer.invoke('close-global-shift')
});
