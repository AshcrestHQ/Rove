const { contextBridge, ipcRenderer } = require('electron');

const roveAPI = {
  isElectron: true,
  // Window controls
  windowMinimize: () => ipcRenderer.invoke('window:minimize'),
  windowMaximize: () => ipcRenderer.invoke('window:maximize'),
  windowClose: () => ipcRenderer.invoke('window:close'),
  windowIsMaximized: () => ipcRenderer.invoke('window:isMaximized'),

  // Filesystem
  getDrives: () => ipcRenderer.invoke('fs:getDrives'),
  getSystemPlaces: () => ipcRenderer.invoke('fs:getSystemPlaces'),
  getHomeDir: () => ipcRenderer.invoke('fs:getHomeDir'),
  listDirectory: (dirPath, options) => ipcRenderer.invoke('fs:listDirectory', dirPath, options),
  getItemStats: (itemPath) => ipcRenderer.invoke('fs:getItemStats', itemPath),
  readFilePreview: (itemPath, maxBytes) => ipcRenderer.invoke('fs:readFilePreview', itemPath, maxBytes),
  openItem: (itemPath) => ipcRenderer.invoke('fs:openItem', itemPath),
  showInFolder: (itemPath) => ipcRenderer.invoke('fs:showInFolder', itemPath),
  createFolder: (parentPath, name) => ipcRenderer.invoke('fs:createFolder', parentPath, name),
  createFile: (parentPath, name, content) => ipcRenderer.invoke('fs:createFile', parentPath, name, content),
  renameItem: (oldPath, newPath) => ipcRenderer.invoke('fs:renameItem', oldPath, newPath),
  deleteItem: (itemPath, permanent) => ipcRenderer.invoke('fs:deleteItem', itemPath, permanent),
  copyItem: (src, dest) => ipcRenderer.invoke('fs:copyItem', src, dest),
  moveItem: (src, dest) => ipcRenderer.invoke('fs:moveItem', src, dest),
  searchFiles: (dirPath, query, recursive, maxResults) => ipcRenderer.invoke('fs:search', dirPath, query, recursive, maxResults),

  // Tags
  getTags: () => ipcRenderer.invoke('tags:getTags'),
  setTag: (itemPath, color) => ipcRenderer.invoke('tags:setTag', itemPath, color),

  // Settings
  getSettings: () => ipcRenderer.invoke('settings:getSettings'),
  setSettings: (settings) => ipcRenderer.invoke('settings:setSettings', settings),
};

// Expose primary Rove API and legacy alias
contextBridge.exposeInMainWorld('roveAPI', roveAPI);
contextBridge.exposeInMainWorld('finderAPI', roveAPI);
