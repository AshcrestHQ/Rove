const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execSync, execFileSync, execFile } = require('child_process');

// Establish Windows App Identity
app.name = 'Rove';
if (process.platform === 'win32') {
  app.setAppUserModelId('com.ashcrest.rove');
}

let mainWindow = null;

// Persistent Configuration & Tags Store with backward-compatible migration
const newConfigDir = path.join(os.homedir(), '.rove');
const newTagsFilePath = path.join(newConfigDir, 'tags.json');
const newSettingsFilePath = path.join(newConfigDir, 'settings.json');
const legacyConfigDir = path.join(os.homedir(), '.aura-finder');
const legacyTagsFilePath = path.join(legacyConfigDir, 'tags.json');

function ensureConfigDir() {
  if (!fs.existsSync(newConfigDir)) {
    fs.mkdirSync(newConfigDir, { recursive: true });
  }
}

// Windows File Attribute Cache & Extraction via attrib.exe
function getWindowsAttributes(dirPath) {
  return new Promise((resolve) => {
    if (process.platform !== 'win32') {
      return resolve({});
    }

    const resolvedDir = path.resolve(dirPath);
    const searchPattern = path.join(resolvedDir, '*');
    execFile(
      'attrib.exe',
      ['/L', '/D', searchPattern],
      { maxBuffer: 10 * 1024 * 1024, windowsHide: true },
      (error, stdout) => {
        const attrMap = {};
        if (stdout) {
          const lines = stdout.split(/\r?\n/);
          for (const rawLine of lines) {
            const line = rawLine.trimEnd();
            if (!line || line.startsWith('Access denied') || line.startsWith('File not found')) continue;

            let flags = '';
            let fullItemPath = '';

            const dirIndex = line.indexOf(resolvedDir);
            if (dirIndex >= 0) {
              flags = line.substring(0, dirIndex);
              fullItemPath = line.substring(dirIndex).trim();
            } else if (line.length > 21) {
              flags = line.substring(0, 21);
              fullItemPath = line.substring(21).trim();
            }

            if (!fullItemPath) continue;
            const baseName = path.basename(fullItemPath).toLowerCase();
            attrMap[baseName] = {
              isHidden: flags.includes('H'),
              isSystem: flags.includes('S'),
              isReadOnly: flags.includes('R'),
            };
          }
        }
        resolve(attrMap);
      }
    );
  });
}

function readJsonSafe(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    const content = fs.readFileSync(filePath, 'utf8').trim();
    if (!content) return null;
    const parsed = JSON.parse(content);
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      return parsed;
    }
    return null;
  } catch (err) {
    console.warn(`Could not parse JSON at ${filePath}:`, err.message);
    return null;
  }
}

function loadTags() {
  ensureConfigDir();

  const legacyTags = readJsonSafe(legacyTagsFilePath);
  const currentTags = readJsonSafe(newTagsFilePath);

  // If both exist, merge legacy tags into current tags without overwriting user updates
  if (legacyTags && currentTags) {
    const merged = { ...legacyTags, ...currentTags };
    // If legacy had items not in current, sync them to current store
    const legacyKeys = Object.keys(legacyTags);
    const hasUnsynced = legacyKeys.some(k => !(k in currentTags));
    if (hasUnsynced) {
      saveTags(merged);
    }
    return merged;
  }

  // If only legacy exists, migrate all to current
  if (legacyTags && !currentTags) {
    saveTags(legacyTags);
    console.log('Migrated legacy tags from .aura-finder to .rove');
    return legacyTags;
  }

  // If current exists
  if (currentTags) {
    return currentTags;
  }

  return {};
}

function saveTags(tags) {
  ensureConfigDir();
  try {
    const cleanData = typeof tags === 'object' && tags !== null ? tags : {};
    fs.writeFileSync(newTagsFilePath, JSON.stringify(cleanData, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save tags:', err);
  }
}

function loadSettings() {
  ensureConfigDir();
  const settings = readJsonSafe(newSettingsFilePath);
  if (settings && typeof settings === 'object') {
    return {
      showHidden: typeof settings.showHidden === 'boolean' ? settings.showHidden : false,
      isDarkMode: typeof settings.isDarkMode === 'boolean' ? settings.isDarkMode : true,
    };
  }
  return { showHidden: false, isDarkMode: true };
}

function saveSettings(settings) {
  ensureConfigDir();
  const current = loadSettings();
  const updated = { ...current, ...settings };
  try {
    fs.writeFileSync(newSettingsFilePath, JSON.stringify(updated, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
  return updated;
}

// Helper: Windows drives detection
function getWindowsDrives() {
  const drives = [];
  try {
    const cmd = `Get-CimInstance Win32_LogicalDisk | Select-Object DeviceID, VolumeName, FreeSpace, Size | ConvertTo-Json`;
    const output = execSync(`powershell.exe -NoProfile -NonInteractive -Command "${cmd}"`, {
      encoding: 'utf8',
      timeout: 4000,
      windowsHide: true,
    });
    const parsed = JSON.parse(output);
    const list = Array.isArray(parsed) ? parsed : [parsed];

    for (const d of list) {
      if (d.DeviceID) {
        drives.push({
          mount: d.DeviceID + '\\',
          name: d.VolumeName || `Local Disk (${d.DeviceID})`,
          freeSpace: d.FreeSpace ? Number(d.FreeSpace) : null,
          totalSpace: d.Size ? Number(d.Size) : null,
        });
      }
    }
  } catch {
    // Fallback: check drive letters C: through Z:
    const letters = 'CDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    for (const letter of letters) {
      const drivePath = `${letter}:\\`;
      if (fs.existsSync(drivePath)) {
        drives.push({
          mount: drivePath,
          name: `Local Disk (${letter}:)`,
          freeSpace: null,
          totalSpace: null,
        });
      }
    }
  }

  if (drives.length === 0) {
    drives.push({ mount: 'C:\\', name: 'Local Disk (C:)', freeSpace: null, totalSpace: null });
  }

  return drives;
}

// System places (Rove sidebar)
function getSystemPlaces() {
  const home = os.homedir();
  return [
    { id: 'home', name: 'Home', path: home, icon: 'home' },
    { id: 'desktop', name: 'Desktop', path: path.join(home, 'Desktop'), icon: 'desktop' },
    { id: 'documents', name: 'Documents', path: path.join(home, 'Documents'), icon: 'documents' },
    { id: 'downloads', name: 'Downloads', path: path.join(home, 'Downloads'), icon: 'downloads' },
    { id: 'pictures', name: 'Pictures', path: path.join(home, 'Pictures'), icon: 'pictures' },
    { id: 'music', name: 'Music', path: path.join(home, 'Music'), icon: 'music' },
    { id: 'videos', name: 'Videos', path: path.join(home, 'Videos'), icon: 'videos' },
  ].filter(place => {
    try {
      return fs.existsSync(place.path);
    } catch {
      return false;
    }
  });
}

function getAppIconPath() {
  const candidatePaths = [
    path.join(__dirname, '../assets/branding/icon.ico'),
    path.join(app.getAppPath(), 'assets/branding/icon.ico'),
    path.join(__dirname, '../assets/branding/icon.png'),
    path.join(app.getAppPath(), 'assets/branding/icon.png'),
  ];
  for (const p of candidatePaths) {
    if (fs.existsSync(p)) return p;
  }
  return undefined;
}

function getIndexPath() {
  const candidatePaths = [
    path.join(__dirname, '../dist/index.html'),
    path.join(app.getAppPath(), 'dist/index.html'),
  ];
  for (const p of candidatePaths) {
    if (fs.existsSync(p)) return p;
  }
  return candidatePaths[0];
}

function createWindow() {
  const iconPath = getAppIconPath();

  mainWindow = new BrowserWindow({
    title: 'Rove',
    width: 1180,
    height: 760,
    minWidth: 780,
    minHeight: 520,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#1e1e1e',
    icon: iconPath,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      webSecurity: true,
    },
  });

  const isDev = process.env.ELECTRON_DEV === '1';
  const distPath = getIndexPath();

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else if (fs.existsSync(distPath)) {
    mainWindow.loadFile(distPath);
  } else {
    mainWindow.loadURL('http://localhost:5173');
  }

  // Security: Restrict navigation to external browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:') || url.startsWith('http:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('http://localhost') && !url.startsWith('file://')) {
      event.preventDefault();
      if (url.startsWith('https:') || url.startsWith('http:')) {
        shell.openExternal(url);
      }
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
}

// App lifecycle
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Window controls IPC
ipcMain.handle('window:minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.handle('window:maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.handle('window:close', () => {
  if (mainWindow) mainWindow.close();
});

ipcMain.handle('window:isMaximized', () => {
  return mainWindow ? mainWindow.isMaximized() : false;
});

// Drives and Places
ipcMain.handle('fs:getDrives', async () => {
  return getWindowsDrives();
});

ipcMain.handle('fs:getSystemPlaces', async () => {
  return getSystemPlaces();
});

ipcMain.handle('fs:getHomeDir', async () => {
  return os.homedir();
});

// List Directory with path validation, Windows attribute detection, and safe reparse handling
ipcMain.handle('fs:listDirectory', async (event, dirPath, options = {}) => {
  const showHidden = Boolean(options && options.showHidden);
  const rawPath = typeof dirPath === 'string' && dirPath.trim() ? dirPath.trim() : os.homedir();
  let targetPath = path.resolve(rawPath);

  const defaultHome = os.homedir();
  if (!fs.existsSync(targetPath)) {
    console.warn(`Directory does not exist: ${targetPath}. Falling back to default home.`);
    targetPath = fs.existsSync(defaultHome) ? defaultHome : 'C:\\';
  }

  try {
    // Parallelize directory read and Windows file attribute discovery
    const [direntsResult, winAttrs] = await Promise.all([
      fs.promises.readdir(targetPath, { withFileTypes: true }),
      getWindowsAttributes(targetPath),
    ]);

    const dirents = direntsResult;
    const tagsMap = loadTags();

    const items = [];
    for (const d of dirents) {
      const isDotHidden = d.name.startsWith('.');
      const lowerName = d.name.toLowerCase();
      const attr = winAttrs[lowerName] || { isHidden: false, isSystem: false };

      const isHidden = isDotHidden || attr.isHidden;
      const isSystem = Boolean(attr.isSystem);

      // Hide items marked Hidden or System by default unless explicitly toggled
      if (!showHidden && (isHidden || isSystem)) {
        continue;
      }

      const fullPath = path.join(targetPath, d.name);
      let isDirectory = d.isDirectory();
      let isFile = d.isFile();
      const isSymlink = d.isSymbolicLink();
      let stat = null;

      // Use lstat to read the link/entry itself WITHOUT recursively following junctions/symlinks
      try {
        stat = await fs.promises.lstat(fullPath);
      } catch {
        // Access denied or unresolvable item
      }

      // If it's a symbolic link or junction, inspect target type safely without recursive traversal
      if (isSymlink) {
        try {
          const targetStat = await fs.promises.stat(fullPath);
          isDirectory = targetStat.isDirectory();
          isFile = targetStat.isFile();
        } catch {
          // If stat fails (e.g. system junction with restricted ACL),
          // treat as non-traversable link to avoid crashes
          isDirectory = false;
          isFile = false;
        }
      }

      const ext = isDirectory ? '' : path.extname(d.name).toLowerCase().replace('.', '');
      const tag = tagsMap[fullPath] || null;

      items.push({
        name: d.name,
        path: fullPath,
        isDirectory,
        isFile,
        isSymlink,
        isSystem,
        size: stat ? stat.size : 0,
        mtime: stat ? stat.mtimeMs : 0,
        ctime: stat ? stat.ctimeMs : 0,
        birthtime: stat ? stat.birthtimeMs : 0,
        extension: ext,
        isHidden,
        tag,
      });
    }

    return {
      path: targetPath,
      name: path.basename(targetPath) || targetPath,
      parent: path.dirname(targetPath) !== targetPath ? path.dirname(targetPath) : null,
      items,
    };
  } catch (error) {
    console.warn(`Could not read directory contents at ${targetPath}:`, error.message);
    return {
      path: targetPath,
      name: path.basename(targetPath) || targetPath,
      parent: path.dirname(targetPath) !== targetPath ? path.dirname(targetPath) : null,
      items: [],
      error: error.code === 'EPERM' || error.code === 'EACCES'
        ? 'Access is denied to this directory or system junction.'
        : (error.message || 'Unable to list directory'),
    };
  }
});

// File Details & Stats
ipcMain.handle('fs:getItemStats', async (event, itemPath) => {
  if (typeof itemPath !== 'string' || !itemPath.trim()) {
    throw new Error('Invalid path');
  }
  const cleanPath = path.resolve(itemPath.trim());
  let stat = null;
  let isSymlink = false;

  try {
    stat = await fs.promises.lstat(cleanPath);
    isSymlink = stat.isSymbolicLink();
  } catch {
    stat = await fs.promises.stat(cleanPath);
  }

  let isDirectory = stat ? stat.isDirectory() : false;
  let isFile = stat ? stat.isFile() : false;

  if (isSymlink) {
    try {
      const targetStat = await fs.promises.stat(cleanPath);
      isDirectory = targetStat.isDirectory();
      isFile = targetStat.isFile();
    } catch {
      // Inaccessible target
    }
  }

  const tagsMap = loadTags();
  const isHidden = path.basename(cleanPath).startsWith('.');

  return {
    name: path.basename(cleanPath),
    path: cleanPath,
    isDirectory,
    isFile,
    isSymlink,
    size: stat ? stat.size : 0,
    mtime: stat ? stat.mtimeMs : 0,
    ctime: stat ? stat.ctimeMs : 0,
    birthtime: stat ? stat.birthtimeMs : 0,
    extension: isDirectory ? '' : path.extname(cleanPath).toLowerCase().replace('.', ''),
    isHidden,
    tag: tagsMap[cleanPath] || null,
  };
});

// Read file preview (for Quick Look)
ipcMain.handle('fs:readFilePreview', async (event, itemPath, maxBytes = 250000) => {
  if (typeof itemPath !== 'string' || !itemPath.trim()) {
    return { type: 'error', message: 'Invalid item path' };
  }
  const cleanPath = path.resolve(itemPath.trim());

  try {
    const stat = await fs.promises.stat(cleanPath);
    if (stat.isDirectory()) {
      try {
        const children = await fs.promises.readdir(cleanPath);
        return { type: 'directory', count: children.length };
      } catch {
        return { type: 'directory', count: 0 };
      }
    }

    const ext = path.extname(cleanPath).toLowerCase().replace('.', '');
    const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp', 'ico'];
    const audioExtensions = ['mp3', 'wav', 'ogg', 'm4a', 'flac'];
    const videoExtensions = ['mp4', 'webm', 'mov'];
    const textExtensions = [
      'txt', 'md', 'json', 'js', 'ts', 'jsx', 'tsx', 'html', 'css', 'scss',
      'xml', 'yaml', 'yml', 'py', 'java', 'c', 'cpp', 'h', 'cs', 'go', 'rs',
      'php', 'rb', 'sh', 'bat', 'ps1', 'sql', 'log', 'ini', 'env', 'toml'
    ];

    if (imageExtensions.includes(ext)) {
      const buffer = await fs.promises.readFile(cleanPath);
      const mime = ext === 'svg' ? 'image/svg+xml' : `image/${ext === 'jpg' ? 'jpeg' : ext}`;
      return {
        type: 'image',
        dataUrl: `data:${mime};base64,${buffer.toString('base64')}`,
        size: stat.size,
      };
    }

    if (audioExtensions.includes(ext)) {
      const buffer = await fs.promises.readFile(cleanPath);
      return {
        type: 'audio',
        dataUrl: `data:audio/${ext};base64,${buffer.toString('base64')}`,
        size: stat.size,
      };
    }

    if (videoExtensions.includes(ext)) {
      // In webSecurity: true, send data URL or buffer stream if small, or path reference
      if (stat.size < 15000000) {
        const buffer = await fs.promises.readFile(cleanPath);
        return {
          type: 'video',
          dataUrl: `data:video/${ext === 'mov' ? 'mp4' : ext};base64,${buffer.toString('base64')}`,
          size: stat.size,
        };
      }
      return {
        type: 'video',
        size: stat.size,
      };
    }

    if (textExtensions.includes(ext) || stat.size < maxBytes) {
      const readSize = Math.min(stat.size, maxBytes);
      const buffer = Buffer.alloc(readSize);
      const fd = await fs.promises.open(cleanPath, 'r');
      await fd.read(buffer, 0, buffer.length, 0);
      await fd.close();
      return {
        type: 'text',
        content: buffer.toString('utf8'),
        isTruncated: stat.size > maxBytes,
        size: stat.size,
      };
    }

    return { type: 'binary', size: stat.size };
  } catch (err) {
    return { type: 'error', message: err.message };
  }
});

// Open Item (Native Windows default app launch)
ipcMain.handle('fs:openItem', async (event, itemPath) => {
  if (typeof itemPath !== 'string' || !itemPath.trim()) return '';
  const cleanPath = path.resolve(itemPath.trim());
  return await shell.openPath(cleanPath);
});

// Reveal in Windows Explorer
ipcMain.handle('fs:showInFolder', async (event, itemPath) => {
  if (typeof itemPath !== 'string' || !itemPath.trim()) return false;
  const cleanPath = path.resolve(itemPath.trim());
  shell.showItemInFolder(cleanPath);
  return true;
});

const INVALID_WINDOWS_CHARS = /[<>:"/\\|?*]/;
const RESERVED_WINDOWS_NAMES = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\..*)?$/i;

function validateWindowsName(name) {
  if (typeof name !== 'string') {
    throw new Error('Name must be a string');
  }
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error('Name cannot be empty');
  }
  if (trimmed === '.' || trimmed === '..') {
    throw new Error('Invalid item name');
  }
  const hasControlChar = [...trimmed].some((c) => c.charCodeAt(0) < 32);
  if (INVALID_WINDOWS_CHARS.test(trimmed) || hasControlChar) {
    throw new Error('A name cannot contain any of the following characters: \\ / : * ? " < > |');
  }
  if (RESERVED_WINDOWS_NAMES.test(trimmed)) {
    throw new Error('The specified name is a reserved Windows device name.');
  }
  if (trimmed.endsWith('.') || trimmed.endsWith(' ')) {
    throw new Error('A name cannot end with a period or a space.');
  }
  return trimmed;
}

// Create Folder (with traversal sanitization and validation)
ipcMain.handle('fs:createFolder', async (event, parentPath, folderName) => {
  if (typeof parentPath !== 'string') {
    throw new Error('Invalid directory path');
  }
  const cleanName = validateWindowsName(folderName);
  const resolvedParent = path.resolve(parentPath.trim());

  if (!fs.existsSync(resolvedParent)) {
    throw new Error('Destination folder does not exist');
  }

  const target = path.join(resolvedParent, cleanName);
  if (fs.existsSync(target)) {
    throw new Error(`An item named "${cleanName}" already exists in this folder.`);
  }

  try {
    await fs.promises.mkdir(target, { recursive: false });
    return target;
  } catch (err) {
    if (err.code === 'EACCES' || err.code === 'EPERM') {
      throw new Error('Permission denied: Unable to create folder in this location.');
    }
    throw new Error(err.message || 'Failed to create folder');
  }
});

// Create File (with traversal sanitization and validation)
ipcMain.handle('fs:createFile', async (event, parentPath, fileName, content = '') => {
  if (typeof parentPath !== 'string') {
    throw new Error('Invalid directory path');
  }
  const cleanName = validateWindowsName(fileName);
  const resolvedParent = path.resolve(parentPath.trim());

  if (!fs.existsSync(resolvedParent)) {
    throw new Error('Destination folder does not exist');
  }

  const target = path.join(resolvedParent, cleanName);
  if (fs.existsSync(target)) {
    throw new Error(`An item named "${cleanName}" already exists in this folder.`);
  }

  try {
    await fs.promises.writeFile(target, content, { encoding: 'utf8', flag: 'wx' });
    return target;
  } catch (err) {
    if (err.code === 'EACCES' || err.code === 'EPERM') {
      throw new Error('Permission denied: Unable to create file in this location.');
    }
    if (err.code === 'EEXIST') {
      throw new Error(`An item named "${cleanName}" already exists in this folder.`);
    }
    throw new Error(err.message || 'Failed to create file');
  }
});

// Rename Item
ipcMain.handle('fs:renameItem', async (event, oldPath, newPath) => {
  if (typeof oldPath !== 'string' || typeof newPath !== 'string') {
    throw new Error('Invalid rename parameters');
  }
  const cleanOld = path.resolve(oldPath.trim());
  const cleanNew = path.resolve(newPath.trim());

  await fs.promises.rename(cleanOld, cleanNew);

  // Migrate tag if present
  const tagsMap = loadTags();
  if (tagsMap[cleanOld]) {
    tagsMap[cleanNew] = tagsMap[cleanOld];
    delete tagsMap[cleanOld];
    saveTags(tagsMap);
  }
  return cleanNew;
});

// Delete Item (Move to Windows Recycle Bin securely via environment variable)
ipcMain.handle('fs:deleteItem', async (event, itemPath, permanent = false) => {
  if (typeof itemPath !== 'string' || !itemPath.trim()) {
    throw new Error('Invalid item path');
  }
  const cleanPath = path.resolve(itemPath.trim());

  if (permanent) {
    const stat = await fs.promises.stat(cleanPath);
    if (stat.isDirectory()) {
      await fs.promises.rm(cleanPath, { recursive: true, force: true });
    } else {
      await fs.promises.unlink(cleanPath);
    }
  } else {
    const stat = await fs.promises.stat(cleanPath);
    const method = stat.isDirectory() ? 'DeleteDirectory' : 'DeleteFile';

    // Command injection safe: Pass item path as an environment variable
    execFileSync('powershell.exe', [
      '-NoProfile',
      '-NonInteractive',
      '-Command',
      `Add-Type -AssemblyName Microsoft.VisualBasic; [Microsoft.VisualBasic.FileIO.FileSystem]::${method}($env:ROVE_TARGET_ITEM, 'OnlyErrorDialogs', 'SendToRecycleBin')`
    ], {
      env: { ...process.env, ROVE_TARGET_ITEM: cleanPath },
      windowsHide: true,
    });
  }

  const tagsMap = loadTags();
  if (tagsMap[cleanPath]) {
    delete tagsMap[cleanPath];
    saveTags(tagsMap);
  }
  return true;
});

// Copy Item
ipcMain.handle('fs:copyItem', async (event, srcPath, destFolder) => {
  if (typeof srcPath !== 'string' || typeof destFolder !== 'string') {
    throw new Error('Invalid copy parameters');
  }
  const cleanSrc = path.resolve(srcPath.trim());
  const cleanDest = path.join(path.resolve(destFolder.trim()), path.basename(cleanSrc));
  await fs.promises.cp(cleanSrc, cleanDest, { recursive: true });
  return cleanDest;
});

// Move Item
ipcMain.handle('fs:moveItem', async (event, srcPath, destFolder) => {
  if (typeof srcPath !== 'string' || typeof destFolder !== 'string') {
    throw new Error('Invalid move parameters');
  }
  const cleanSrc = path.resolve(srcPath.trim());
  const cleanDest = path.join(path.resolve(destFolder.trim()), path.basename(cleanSrc));
  await fs.promises.rename(cleanSrc, cleanDest);
  return cleanDest;
});

// Tags System
ipcMain.handle('tags:getTags', async () => {
  return loadTags();
});

ipcMain.handle('tags:setTag', async (event, itemPath, color) => {
  if (typeof itemPath !== 'string' || !itemPath.trim()) {
    throw new Error('Invalid item path');
  }
  const cleanPath = path.resolve(itemPath.trim());
  const validColors = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'gray', null];
  if (!validColors.includes(color)) {
    throw new Error('Invalid tag color');
  }

  const tagsMap = loadTags();
  if (!color) {
    delete tagsMap[cleanPath];
  } else {
    tagsMap[cleanPath] = color;
  }
  saveTags(tagsMap);
  return tagsMap;
});

// Settings System (Persisted in ~/.rove/settings.json)
ipcMain.handle('settings:getSettings', async () => {
  return loadSettings();
});

ipcMain.handle('settings:setSettings', async (event, newSettings) => {
  if (typeof newSettings !== 'object' || newSettings === null) {
    throw new Error('Invalid settings object');
  }
  return saveSettings(newSettings);
});

// Search
ipcMain.handle('fs:search', async (event, dirPath, query, recursive = true, maxResults = 100) => {
  if (typeof dirPath !== 'string' || typeof query !== 'string') return [];
  const cleanDir = path.resolve(dirPath.trim());
  const results = [];
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return [];

  const visited = new Set();

  async function walk(current) {
    if (results.length >= maxResults) return;
    const resolvedCurrent = path.resolve(current);
    if (visited.has(resolvedCurrent)) return;
    visited.add(resolvedCurrent);

    try {
      const dirents = await fs.promises.readdir(current, { withFileTypes: true });
      for (const d of dirents) {
        if (d.name.startsWith('.')) continue;
        const isSymlink = d.isSymbolicLink();
        const full = path.join(current, d.name);

        if (d.name.toLowerCase().includes(lowerQuery)) {
          let stat = null;
          try {
            stat = await fs.promises.lstat(full);
          } catch {}

          results.push({
            name: d.name,
            path: full,
            isDirectory: d.isDirectory(),
            isFile: d.isFile(),
            isSymlink,
            size: stat ? stat.size : 0,
            mtime: stat ? stat.mtimeMs : 0,
            extension: d.isDirectory() ? '' : path.extname(d.name).toLowerCase().replace('.', ''),
          });
        }

        // Avoid following junctions/symlinks recursively to prevent loops
        if (d.isDirectory() && !isSymlink && recursive && results.length < maxResults) {
          await walk(full);
        }
      }
    } catch {
      // Ignore permission or file-lock errors
    }
  }

  await walk(cleanDir);
  return results;
});
