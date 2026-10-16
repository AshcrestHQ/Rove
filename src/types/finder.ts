export type ViewMode = 'icons' | 'list' | 'columns' | 'gallery';

export type SortField = 'name' | 'date' | 'size' | 'kind';
export type SortDirection = 'asc' | 'desc';

export type TagColor = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'gray';

export interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
  isFile: boolean;
  isSymlink?: boolean;
  isSystem?: boolean;
  size: number;
  mtime: number;
  ctime?: number;
  birthtime?: number;
  extension: string;
  isHidden: boolean;
  tag?: TagColor | null;
}

export interface DirectoryResult {
  path: string;
  name: string;
  parent: string | null;
  items: FileItem[];
  error?: string;
}

export interface DriveInfo {
  mount: string;
  name: string;
  freeSpace: number | null;
  totalSpace: number | null;
}

export interface SystemPlace {
  id: string;
  name: string;
  path: string;
  icon: string;
}

export interface FilePreview {
  type: 'image' | 'text' | 'audio' | 'video' | 'directory' | 'binary' | 'error';
  content?: string;
  dataUrl?: string;
  url?: string;
  count?: number;
  size?: number;
  isTruncated?: boolean;
  message?: string;
}

export interface TabState {
  id: string;
  title: string;
  currentPath: string;
  history: string[];
  historyIndex: number;
  viewMode: ViewMode;
  searchQuery: string;
}

export interface AppSettings {
  showHidden?: boolean;
  isDarkMode?: boolean;
}

export type RoveAPI = FinderAPI;

export interface FinderAPI {
  isElectron: boolean;
  windowMinimize: () => Promise<void>;
  windowMaximize: () => Promise<void>;
  windowClose: () => Promise<void>;
  windowIsMaximized: () => Promise<boolean>;
  getDrives: () => Promise<DriveInfo[]>;
  getSystemPlaces: () => Promise<SystemPlace[]>;
  getHomeDir: () => Promise<string>;
  listDirectory: (dirPath: string, options?: { showHidden?: boolean }) => Promise<DirectoryResult>;
  getItemStats: (itemPath: string) => Promise<FileItem>;
  readFilePreview: (itemPath: string, maxBytes?: number) => Promise<FilePreview>;
  openItem: (itemPath: string) => Promise<string>;
  showInFolder: (itemPath: string) => Promise<boolean>;
  createFolder: (parentPath: string, name: string) => Promise<string>;
  createFile: (parentPath: string, name: string, content?: string) => Promise<string>;
  renameItem: (oldPath: string, newPath: string) => Promise<string>;
  deleteItem: (itemPath: string, permanent?: boolean) => Promise<boolean>;
  copyItem: (src: string, dest: string) => Promise<string>;
  moveItem: (src: string, dest: string) => Promise<string>;
  searchFiles: (dirPath: string, query: string, recursive?: boolean, maxResults?: number) => Promise<FileItem[]>;
  getTags: () => Promise<Record<string, TagColor>>;
  setTag: (itemPath: string, color: TagColor | null) => Promise<Record<string, TagColor>>;
  getSettings: () => Promise<AppSettings>;
  setSettings: (settings: Partial<AppSettings>) => Promise<AppSettings>;
}

declare global {
  interface Window {
    roveAPI?: RoveAPI;
    finderAPI?: FinderAPI;
  }
}
