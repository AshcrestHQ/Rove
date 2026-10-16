import type { AppSettings, DirectoryResult, DriveInfo, FileItem, FilePreview, SystemPlace, TagColor } from '../types/finder';

// In-Memory Virtual File System for Browser / Web Demo fallback
class MockFileSystem {
  private drives: DriveInfo[] = [
    { mount: 'C:\\', name: 'Windows (C:)', freeSpace: 142000000000, totalSpace: 512000000000 },
    { mount: 'D:\\', name: 'Data Drive (D:)', freeSpace: 840000000000, totalSpace: 1024000000000 },
  ];

  private places: SystemPlace[] = [
    { id: 'desktop', name: 'Desktop', path: 'C:\\Users\\User\\Desktop', icon: 'desktop' },
    { id: 'documents', name: 'Documents', path: 'C:\\Users\\User\\Documents', icon: 'documents' },
    { id: 'downloads', name: 'Downloads', path: 'C:\\Users\\User\\Downloads', icon: 'downloads' },
    { id: 'pictures', name: 'Pictures', path: 'C:\\Users\\User\\Pictures', icon: 'pictures' },
    { id: 'music', name: 'Music', path: 'C:\\Users\\User\\Music', icon: 'music' },
    { id: 'videos', name: 'Videos', path: 'C:\\Users\\User\\Videos', icon: 'videos' },
    { id: 'home', name: 'User Home', path: 'C:\\Users\\User', icon: 'home' },
  ];

  private items: Map<string, FileItem[]> = new Map();
  private fileContents: Map<string, string> = new Map();
  private tags: Record<string, TagColor> = {};

  constructor() {
    this.initMockData();
  }

  private initMockData() {
    const userHome = 'C:\\Users\\User';
    const desktop = `${userHome}\\Desktop`;
    const docs = `${userHome}\\Documents`;
    const downloads = `${userHome}\\Downloads`;
    const pics = `${userHome}\\Pictures`;

    // Root C:
    this.items.set('C:\\', [
      { name: 'Program Files', path: 'C:\\Program Files', isDirectory: true, isFile: false, size: 0, mtime: Date.now() - 86400000 * 30, extension: '', isHidden: false },
      { name: 'Program Files (x86)', path: 'C:\\Program Files (x86)', isDirectory: true, isFile: false, size: 0, mtime: Date.now() - 86400000 * 30, extension: '', isHidden: false },
      { name: 'Users', path: 'C:\\Users', isDirectory: true, isFile: false, size: 0, mtime: Date.now() - 86400000 * 40, extension: '', isHidden: false },
      { name: 'Windows', path: 'C:\\Windows', isDirectory: true, isFile: false, size: 0, mtime: Date.now() - 86400000 * 10, extension: '', isHidden: false },
    ]);

    // Users
    this.items.set('C:\\Users', [
      { name: 'Public', path: 'C:\\Users\\Public', isDirectory: true, isFile: false, size: 0, mtime: Date.now() - 86400000 * 50, extension: '', isHidden: false },
      { name: 'User', path: userHome, isDirectory: true, isFile: false, size: 0, mtime: Date.now() - 86400000 * 5, extension: '', isHidden: false },
    ]);

    // User Home
    this.items.set(userHome, [
      { name: 'Desktop', path: desktop, isDirectory: true, isFile: false, size: 0, mtime: Date.now() - 86400000 * 1, extension: '', isHidden: false },
      { name: 'Documents', path: docs, isDirectory: true, isFile: false, size: 0, mtime: Date.now() - 86400000 * 2, extension: '', isHidden: false },
      { name: 'Downloads', path: downloads, isDirectory: true, isFile: false, size: 0, mtime: Date.now() - 86400000 * 1, extension: '', isHidden: false },
      { name: 'Pictures', path: pics, isDirectory: true, isFile: false, size: 0, mtime: Date.now() - 86400000 * 4, extension: '', isHidden: false },
      { name: 'Music', path: `${userHome}\\Music`, isDirectory: true, isFile: false, size: 0, mtime: Date.now() - 86400000 * 15, extension: '', isHidden: false },
      { name: 'Videos', path: `${userHome}\\Videos`, isDirectory: true, isFile: false, size: 0, mtime: Date.now() - 86400000 * 20, extension: '', isHidden: false },
      { name: '.gitconfig', path: `${userHome}\\.gitconfig`, isDirectory: false, isFile: true, size: 420, mtime: Date.now() - 86400000 * 12, extension: 'gitconfig', isHidden: true },
    ]);

    // Desktop
    this.items.set(desktop, [
      { name: 'Project Roadmap.md', path: `${desktop}\\Project Roadmap.md`, isDirectory: false, isFile: true, size: 3420, mtime: Date.now() - 3600000 * 4, extension: 'md', isHidden: false, tag: 'blue' },
      { name: 'Financial_Q3_Report.pdf', path: `${desktop}\\Financial_Q3_Report.pdf`, isDirectory: false, isFile: true, size: 2840000, mtime: Date.now() - 86400000 * 2, extension: 'pdf', isHidden: false, tag: 'green' },
      { name: 'App Screenshots', path: `${desktop}\\App Screenshots`, isDirectory: true, isFile: false, size: 0, mtime: Date.now() - 86400000 * 3, extension: '', isHidden: false },
      { name: 'server_config.json', path: `${desktop}\\server_config.json`, isDirectory: false, isFile: true, size: 1250, mtime: Date.now() - 7200000, extension: 'json', isHidden: false, tag: 'orange' },
      { name: 'demo_script.py', path: `${desktop}\\demo_script.py`, isDirectory: false, isFile: true, size: 4510, mtime: Date.now() - 86400000 * 1, extension: 'py', isHidden: false, tag: 'purple' },
    ]);

    // Documents
    this.items.set(docs, [
      { name: 'Design Specs', path: `${docs}\\Design Specs`, isDirectory: true, isFile: false, size: 0, mtime: Date.now() - 86400000 * 3, extension: '', isHidden: false },
      { name: 'Contract_Agreement.docx', path: `${docs}\\Contract_Agreement.docx`, isDirectory: false, isFile: true, size: 850000, mtime: Date.now() - 86400000 * 7, extension: 'docx', isHidden: false, tag: 'red' },
      { name: 'Architecture_Design.png', path: `${docs}\\Architecture_Design.png`, isDirectory: false, isFile: true, size: 1450000, mtime: Date.now() - 86400000 * 2, extension: 'png', isHidden: false },
      { name: 'Notes.txt', path: `${docs}\\Notes.txt`, isDirectory: false, isFile: true, size: 890, mtime: Date.now() - 1800000, extension: 'txt', isHidden: false },
    ]);

    // Downloads
    this.items.set(downloads, [
      { name: 'VSCodeSetup-x64.exe', path: `${downloads}\\VSCodeSetup-x64.exe`, isDirectory: false, isFile: true, size: 98400000, mtime: Date.now() - 86400000 * 1, extension: 'exe', isHidden: false },
      { name: 'dataset_archive.zip', path: `${downloads}\\dataset_archive.zip`, isDirectory: false, isFile: true, size: 45200000, mtime: Date.now() - 86400000 * 3, extension: 'zip', isHidden: false },
      { name: 'invoice_2026_10.pdf', path: `${downloads}\\invoice_2026_10.pdf`, isDirectory: false, isFile: true, size: 120400, mtime: Date.now() - 86400000 * 5, extension: 'pdf', isHidden: false, tag: 'yellow' },
    ]);

    // Pictures
    this.items.set(pics, [
      { name: 'wallpaper_catalina.jpg', path: `${pics}\\wallpaper_catalina.jpg`, isDirectory: false, isFile: true, size: 3420000, mtime: Date.now() - 86400000 * 8, extension: 'jpg', isHidden: false },
      { name: 'profile_avatar.png', path: `${pics}\\profile_avatar.png`, isDirectory: false, isFile: true, size: 840000, mtime: Date.now() - 86400000 * 12, extension: 'png', isHidden: false },
      { name: 'macOS_Sonoma_Graph.svg', path: `${pics}\\macOS_Sonoma_Graph.svg`, isDirectory: false, isFile: true, size: 45000, mtime: Date.now() - 86400000 * 2, extension: 'svg', isHidden: false },
    ]);

    // Sample text contents
    this.fileContents.set(`${desktop}\\Project Roadmap.md`, `# Rove — Your files. Your flow. 🧭\n\nA polished, open-source file manager for Windows by AshcrestHQ.\n\n## Key Features\n- 🧭 Clean, distraction-free modern navigation\n- 📂 Iconic Miller Columns View (Cascading horizontal scroll)\n- ⚡ Instant Quick Look Preview with Spacebar\n- 🏷️ Color Tags (Red, Orange, Yellow, Green, Blue, Purple, Gray)\n- 🗂️ Multi-Tab browsing with keyboard shortcuts\n- 🗑️ Native Windows Recycle Bin Integration\n- 🔍 Real-time Search and Breadcrumb Navigation\n\nBuilt with React, TypeScript, and Electron.`);
    this.fileContents.set(`${desktop}\\server_config.json`, `{\n  "appName": "Rove",\n  "organization": "AshcrestHQ",\n  "version": "0.1.0-alpha.1",\n  "port": 8080,\n  "theme": "vibrancy",\n  "features": {\n    "millerColumns": true,\n    "quickLook": true,\n    "colorTags": true,\n    "tabs": true\n  }\n}`);
    this.fileContents.set(`${desktop}\\demo_script.py`, `import sys\nimport os\n\ndef main():\n    print("Welcome to Rove by AshcrestHQ!")\n    cwd = os.getcwd()\n    print(f"Current Directory: {cwd}")\n    print("All systems operational.")\n\nif __name__ == "__main__":\n    main()`);
    this.fileContents.set(`${docs}\\Notes.txt`, `Rove Project Notes - Oct 2026:\n1. Miller Columns cascading horizontal scroll.\n2. Spacebar Quick Look with instant previews.\n3. Keyboard shortcuts: Spacebar, Enter, Backspace, Ctrl+T, Ctrl+W, Ctrl+I.\n4. AshcrestHQ open-source distribution.`);
  }

  getDrives(): DriveInfo[] {
    return this.drives;
  }

  getPlaces(): SystemPlace[] {
    return this.places;
  }

  getHomeDir(): string {
    return 'C:\\Users\\User';
  }

  listDirectory(dirPath: string, options: { showHidden?: boolean } = {}): DirectoryResult {
    const normalized = dirPath.replace(/\//g, '\\').replace(/\\$/, '') || 'C:\\';
    let items = this.items.get(normalized);
    if (!items) {
      // Find case insensitive or default
      const key = Array.from(this.items.keys()).find(k => k.toLowerCase() === normalized.toLowerCase());
      items = key ? this.items.get(key) : [];
    }

    const filtered = (items || []).filter(item => {
      if (!options.showHidden && item.isHidden) return false;
      return true;
    });

    const parent = normalized.includes('\\') && normalized !== 'C:\\' ? normalized.substring(0, normalized.lastIndexOf('\\')) || 'C:\\' : null;

    return {
      path: normalized,
      name: normalized.split('\\').pop() || normalized,
      parent,
      items: filtered,
    };
  }

  readFilePreview(itemPath: string): FilePreview {
    const ext = itemPath.split('.').pop()?.toLowerCase() || '';
    if (this.fileContents.has(itemPath)) {
      return {
        type: 'text',
        content: this.fileContents.get(itemPath),
        size: this.fileContents.get(itemPath)!.length,
      };
    }

    if (['png', 'jpg', 'jpeg', 'svg', 'webp'].includes(ext)) {
      return {
        type: 'image',
        dataUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
        size: 2400000,
      };
    }

    if (ext === 'pdf') {
      return {
        type: 'text',
        content: `[PDF Document Preview]\nDocument: ${itemPath.split('\\').pop()}\nPages: 12\nAuthor: Apple / Microsoft Corporation\nEncrypted: No`,
        size: 1540000,
      };
    }

    return { type: 'binary', size: 102400 };
  }

  createFolder(parentPath: string, name: string): string {
    const trimmed = name.trim();
    if (!trimmed || trimmed === '.' || trimmed === '..') {
      throw new Error('Invalid folder name');
    }
    const current = this.items.get(parentPath) || [];
    if (current.some(i => i.name.toLowerCase() === trimmed.toLowerCase())) {
      throw new Error(`An item named "${trimmed}" already exists in this folder.`);
    }
    const newPath = `${parentPath}\\${trimmed}`;
    current.push({
      name: trimmed,
      path: newPath,
      isDirectory: true,
      isFile: false,
      size: 0,
      mtime: Date.now(),
      extension: '',
      isHidden: false,
    });
    this.items.set(parentPath, current);
    this.items.set(newPath, []);
    return newPath;
  }

  createFile(parentPath: string, name: string, content = ''): string {
    const trimmed = name.trim();
    if (!trimmed || trimmed === '.' || trimmed === '..') {
      throw new Error('Invalid file name');
    }
    const current = this.items.get(parentPath) || [];
    if (current.some(i => i.name.toLowerCase() === trimmed.toLowerCase())) {
      throw new Error(`An item named "${trimmed}" already exists in this folder.`);
    }
    const newPath = `${parentPath}\\${trimmed}`;
    const ext = trimmed.split('.').pop()?.toLowerCase() || '';
    current.push({
      name: trimmed,
      path: newPath,
      isDirectory: false,
      isFile: true,
      size: content.length,
      mtime: Date.now(),
      extension: ext,
      isHidden: false,
    });
    this.items.set(parentPath, current);
    this.fileContents.set(newPath, content);
    return newPath;
  }

  renameItem(oldPath: string, newPath: string): string {
    const parent = oldPath.substring(0, oldPath.lastIndexOf('\\'));
    const newName = newPath.split('\\').pop() || '';
    const current = this.items.get(parent) || [];
    const item = current.find(i => i.path === oldPath);
    if (item) {
      item.name = newName;
      item.path = newPath;
      item.extension = item.isDirectory ? '' : newName.split('.').pop()?.toLowerCase() || '';
    }
    return newPath;
  }

  deleteItem(itemPath: string): boolean {
    const parent = itemPath.substring(0, itemPath.lastIndexOf('\\'));
    const current = this.items.get(parent) || [];
    this.items.set(parent, current.filter(i => i.path !== itemPath));
    this.items.delete(itemPath);
    delete this.tags[itemPath];
    return true;
  }

  setTag(itemPath: string, color: TagColor | null): Record<string, TagColor> {
    if (!color) {
      delete this.tags[itemPath];
    } else {
      this.tags[itemPath] = color;
    }
    return { ...this.tags };
  }

  getTags(): Record<string, TagColor> {
    return { ...this.tags };
  }

  getSettings(): AppSettings {
    const storedHidden = typeof localStorage !== 'undefined' ? localStorage.getItem('rove_show_hidden') : null;
    const storedDark = typeof localStorage !== 'undefined' ? localStorage.getItem('rove_is_dark_mode') : null;
    return {
      showHidden: storedHidden !== null ? storedHidden === 'true' : false,
      isDarkMode: storedDark !== null ? storedDark === 'true' : true,
    };
  }

  setSettings(settings: Partial<AppSettings>): AppSettings {
    if (typeof localStorage !== 'undefined') {
      if (settings.showHidden !== undefined) {
        localStorage.setItem('rove_show_hidden', String(settings.showHidden));
      }
      if (settings.isDarkMode !== undefined) {
        localStorage.setItem('rove_is_dark_mode', String(settings.isDarkMode));
      }
    }
    return this.getSettings();
  }
}

const mockFS = new MockFileSystem();

// Unified File Service
export const FileService = {
  getAPI() {
    if (typeof window !== 'undefined') {
      return window.roveAPI || window.finderAPI;
    }
    return undefined;
  },

  isElectron(): boolean {
    return !!this.getAPI()?.isElectron;
  },

  async windowMinimize(): Promise<void> {
    const api = this.getAPI();
    if (api) return api.windowMinimize();
  },

  async windowMaximize(): Promise<void> {
    const api = this.getAPI();
    if (api) return api.windowMaximize();
  },

  async windowClose(): Promise<void> {
    const api = this.getAPI();
    if (api) return api.windowClose();
  },

  async windowIsMaximized(): Promise<boolean> {
    const api = this.getAPI();
    if (api) return api.windowIsMaximized();
    return false;
  },

  async getDrives(): Promise<DriveInfo[]> {
    const api = this.getAPI();
    if (api) return api.getDrives();
    return mockFS.getDrives();
  },

  async getSystemPlaces(): Promise<SystemPlace[]> {
    const api = this.getAPI();
    if (api) return api.getSystemPlaces();
    return mockFS.getPlaces();
  },

  async getHomeDir(): Promise<string> {
    const api = this.getAPI();
    if (api) return api.getHomeDir();
    return mockFS.getHomeDir();
  },

  async listDirectory(dirPath: string, options?: { showHidden?: boolean }): Promise<DirectoryResult> {
    const api = this.getAPI();
    if (api) return api.listDirectory(dirPath, options);
    return mockFS.listDirectory(dirPath, options);
  },

  async getItemStats(itemPath: string): Promise<FileItem> {
    const api = this.getAPI();
    if (api) return api.getItemStats(itemPath);
    return {
      name: itemPath.split('\\').pop() || '',
      path: itemPath,
      isDirectory: false,
      isFile: true,
      size: 1024,
      mtime: Date.now(),
      extension: itemPath.split('.').pop() || '',
      isHidden: false,
    };
  },

  async readFilePreview(itemPath: string, maxBytes?: number): Promise<FilePreview> {
    const api = this.getAPI();
    if (api) return api.readFilePreview(itemPath, maxBytes);
    return mockFS.readFilePreview(itemPath);
  },

  async openItem(itemPath: string): Promise<string> {
    const api = this.getAPI();
    if (api) return api.openItem(itemPath);
    alert(`[Simulated Open] Opening: ${itemPath}`);
    return '';
  },

  async showInFolder(itemPath: string): Promise<boolean> {
    const api = this.getAPI();
    if (api) return api.showInFolder(itemPath);
    return true;
  },

  async createFolder(parentPath: string, name: string): Promise<string> {
    const api = this.getAPI();
    if (api) return api.createFolder(parentPath, name);
    return mockFS.createFolder(parentPath, name);
  },

  async createFile(parentPath: string, name: string, content?: string): Promise<string> {
    const api = this.getAPI();
    if (api) return api.createFile(parentPath, name, content);
    return mockFS.createFile(parentPath, name, content);
  },

  async renameItem(oldPath: string, newPath: string): Promise<string> {
    const api = this.getAPI();
    if (api) return api.renameItem(oldPath, newPath);
    return mockFS.renameItem(oldPath, newPath);
  },

  async deleteItem(itemPath: string, permanent?: boolean): Promise<boolean> {
    const api = this.getAPI();
    if (api) return api.deleteItem(itemPath, permanent);
    return mockFS.deleteItem(itemPath);
  },

  async copyItem(src: string, dest: string): Promise<string> {
    const api = this.getAPI();
    if (api) return api.copyItem(src, dest);
    return dest;
  },

  async moveItem(src: string, dest: string): Promise<string> {
    const api = this.getAPI();
    if (api) return api.moveItem(src, dest);
    return dest;
  },

  async searchFiles(dirPath: string, query: string, recursive = true): Promise<FileItem[]> {
    const api = this.getAPI();
    if (api) return api.searchFiles(dirPath, query, recursive);
    const q = query.toLowerCase();
    const result: FileItem[] = [];
    const dirRes = mockFS.listDirectory(dirPath);
    for (const item of dirRes.items) {
      if (item.name.toLowerCase().includes(q)) result.push(item);
    }
    return result;
  },

  async getTags(): Promise<Record<string, TagColor>> {
    const api = this.getAPI();
    if (api) return api.getTags();
    return mockFS.getTags();
  },

  async setTag(itemPath: string, color: TagColor | null): Promise<Record<string, TagColor>> {
    const api = this.getAPI();
    if (api) return api.setTag(itemPath, color);
    return mockFS.setTag(itemPath, color);
  },

  async getSettings(): Promise<AppSettings> {
    const api = this.getAPI();
    if (api && api.getSettings) return api.getSettings();
    return mockFS.getSettings();
  },

  async setSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    if (typeof localStorage !== 'undefined') {
      if (settings.showHidden !== undefined) {
        localStorage.setItem('rove_show_hidden', String(settings.showHidden));
      }
      if (settings.isDarkMode !== undefined) {
        localStorage.setItem('rove_is_dark_mode', String(settings.isDarkMode));
      }
    }
    const api = this.getAPI();
    if (api && api.setSettings) return api.setSettings(settings);
    return mockFS.setSettings(settings);
  },
};
