import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  DirectoryResult,
  DriveInfo,
  FileItem,
  SortDirection,
  SortField,
  SystemPlace,
  TabState,
  TagColor,
  ViewMode
} from './types/finder';
import { FileService } from './services/fileService';
import { Sidebar } from './components/Sidebar';
import { Toolbar } from './components/Toolbar';
import { TabBar } from './components/TabBar';
import { PathBar } from './components/PathBar';
import { IconsView } from './components/views/IconsView';
import { ListView } from './components/views/ListView';
import { ColumnsView } from './components/views/ColumnsView';
import { GalleryView } from './components/views/GalleryView';
import { QuickLookModal } from './components/QuickLookModal';
import { ContextMenu } from './components/ContextMenu';
import { GetInfoModal } from './components/GetInfoModal';
import { AboutModal } from './components/AboutModal';
import { NameEntryModal } from './components/NameEntryModal';

export const App: React.FC = () => {
  // Theme state with persistent localStorage hydration
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('rove_is_dark_mode');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  // System environments
  const [places, setPlaces] = useState<SystemPlace[]>([]);
  const [drives, setDrives] = useState<DriveInfo[]>([]);
  const [sidebarWidth, setSidebarWidth] = useState(210);

  // Initialization lifecycle guard
  const [isInitialized, setIsInitialized] = useState(false);

  // Tabs state
  const [tabs, setTabs] = useState<TabState[]>([
    {
      id: 'tab-1',
      title: 'Home',
      currentPath: '',
      history: [],
      historyIndex: 0,
      viewMode: 'icons',
      searchQuery: '',
    },
  ]);
  const [activeTabId, setActiveTabId] = useState('tab-1');

  // Directory Data for active tab
  const [dirResult, setDirResult] = useState<DirectoryResult>({
    path: '',
    name: '',
    parent: null,
    items: [],
  });
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FileItem | null>(null);

  // View preferences
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [showHidden, setShowHidden] = useState<boolean>(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('rove_show_hidden');
      return saved !== null ? saved === 'true' : false;
    }
    return false;
  });
  const [iconScale, setIconScale] = useState(1.0);
  const [selectedTag, setSelectedTag] = useState<TagColor | null>(null);

  // Modals & Popups
  const [nameModal, setNameModal] = useState<{ isOpen: boolean; mode: 'folder' | 'file' }>({
    isOpen: false,
    mode: 'folder',
  });
  const [quickLookItem, setQuickLookItem] = useState<FileItem | null>(null);
  const [getInfoItem, setGetInfoItem] = useState<FileItem | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item: FileItem | null } | null>(null);
  const [renamingItem, setRenamingItem] = useState<FileItem | null>(null);
  const [showAboutModal, setShowAboutModal] = useState(false);

  const activeTab = useMemo(() => {
    return tabs.find((t) => t.id === activeTabId) || tabs[0];
  }, [tabs, activeTabId]);

  // Load system places, drives & persisted preferences on mount
  useEffect(() => {
    async function initSystem() {
      try {
        const [placesList, drivesList, homePath, settings] = await Promise.all([
          FileService.getSystemPlaces(),
          FileService.getDrives(),
          FileService.getHomeDir(),
          FileService.getSettings(),
        ]);

        if (settings) {
          if (typeof settings.showHidden === 'boolean') {
            setShowHidden(settings.showHidden);
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem('rove_show_hidden', String(settings.showHidden));
            }
          }
          if (typeof settings.isDarkMode === 'boolean') {
            setIsDarkMode(settings.isDarkMode);
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem('rove_is_dark_mode', String(settings.isDarkMode));
            }
          }
        }

        setPlaces(placesList);
        setDrives(drivesList);

        const initialPath = homePath || (drivesList[0]?.mount ?? 'C:\\');
        setTabs([
          {
            id: 'tab-1',
            title: initialPath.split('\\').filter(Boolean).pop() || 'Home',
            currentPath: initialPath,
            history: [initialPath],
            historyIndex: 0,
            viewMode: 'icons',
            searchQuery: '',
          },
        ]);
        setIsInitialized(true);
      } catch (err) {
        console.error('System initialization error:', err);
        setIsInitialized(true);
      }
    }

    initSystem();
  }, []);

  // Sync dark mode class on document element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Load items when active tab path or showHidden changes
  const loadDirectory = useCallback(async (dirPath: string) => {
    if (!dirPath) return;
    setLoading(true);
    try {
      const res = await FileService.listDirectory(dirPath, { showHidden });
      setDirResult(res);
      setSelectedItem(null);
    } catch (err) {
      console.error('Failed to load directory:', err);
    } finally {
      setLoading(false);
    }
  }, [showHidden]);

  // Strictly execute directory listing after system and settings are initialized
  useEffect(() => {
    if (isInitialized && activeTab?.currentPath) {
      loadDirectory(activeTab.currentPath);
    }
  }, [isInitialized, activeTab?.currentPath, showHidden, loadDirectory]);

  // Navigate to new path (pushes to history)
  const navigateTo = useCallback((newPath: string) => {
    setTabs((prev) =>
      prev.map((tab) => {
        if (tab.id === activeTabId) {
          const newHistory = tab.history.slice(0, tab.historyIndex + 1);
          newHistory.push(newPath);
          return {
            ...tab,
            currentPath: newPath,
            title: newPath.split('\\').filter(Boolean).pop() || newPath,
            history: newHistory,
            historyIndex: newHistory.length - 1,
            searchQuery: '',
          };
        }
        return tab;
      })
    );
  }, [activeTabId]);

  // History Navigation: Back
  const handleGoBack = useCallback(() => {
    if (activeTab.historyIndex > 0) {
      const nextIndex = activeTab.historyIndex - 1;
      const targetPath = activeTab.history[nextIndex];
      setTabs((prev) =>
        prev.map((tab) =>
          tab.id === activeTabId
            ? {
                ...tab,
                historyIndex: nextIndex,
                currentPath: targetPath,
                title: targetPath.split('\\').filter(Boolean).pop() || targetPath,
              }
            : tab
        )
      );
    }
  }, [activeTab, activeTabId]);

  // History Navigation: Forward
  const handleGoForward = useCallback(() => {
    if (activeTab.historyIndex < activeTab.history.length - 1) {
      const nextIndex = activeTab.historyIndex + 1;
      const targetPath = activeTab.history[nextIndex];
      setTabs((prev) =>
        prev.map((tab) =>
          tab.id === activeTabId
            ? {
                ...tab,
                historyIndex: nextIndex,
                currentPath: targetPath,
                title: targetPath.split('\\').filter(Boolean).pop() || targetPath,
              }
            : tab
        )
      );
    }
  }, [activeTab, activeTabId]);

  // View Mode Change for Active Tab
  const handleViewModeChange = (mode: ViewMode) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === activeTabId ? { ...t, viewMode: mode } : t))
    );
  };

  // Search Query Change for Active Tab
  const handleSearchChange = (query: string) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === activeTabId ? { ...t, searchQuery: query } : t))
    );
  };

  // Tab operations
  const handleNewTab = useCallback(() => {
    const newId = `tab-${Date.now()}`;
    const newTab: TabState = {
      id: newId,
      title: activeTab.title,
      currentPath: activeTab.currentPath,
      history: [activeTab.currentPath],
      historyIndex: 0,
      viewMode: activeTab.viewMode,
      searchQuery: '',
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newId);
  }, [activeTab]);

  const handleCloseTab = useCallback((tabId: string) => {
    setTabs((prev) => {
      if (prev.length <= 1) return prev;
      const remaining = prev.filter((t) => t.id !== tabId);
      setActiveTabId(remaining[remaining.length - 1].id);
      return remaining;
    });
  }, []);

  // Open Item: If directory, navigate; if file, launch with native OS default app
  const handleOpenItem = useCallback(async (item: FileItem) => {
    if (item.isDirectory) {
      navigateTo(item.path);
    } else {
      await FileService.openItem(item.path);
    }
  }, [navigateTo]);

  // Toggle Dark Mode with instant persistence
  const handleToggleDarkMode = useCallback(async () => {
    const nextVal = !isDarkMode;
    setIsDarkMode(nextVal);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('rove_is_dark_mode', String(nextVal));
    }
    try {
      await FileService.setSettings({ isDarkMode: nextVal });
    } catch (e) {
      console.warn('Failed to save dark mode setting:', e);
    }
  }, [isDarkMode]);

  // Toggle Hidden Files Visibility with instant persistence
  const handleToggleHidden = useCallback(async () => {
    const nextVal = !showHidden;
    setShowHidden(nextVal);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('rove_show_hidden', String(nextVal));
    }
    try {
      await FileService.setSettings({ showHidden: nextVal });
    } catch (e) {
      console.warn('Failed to save settings via IPC:', e);
    }
  }, [showHidden]);

  // Create New Folder Dialog Trigger
  const handleCreateFolder = useCallback(() => {
    setNameModal({ isOpen: true, mode: 'folder' });
  }, []);

  // Create New File Dialog Trigger
  const handleCreateFile = useCallback(() => {
    setNameModal({ isOpen: true, mode: 'file' });
  }, []);

  // Submit Handler for Name Entry Modal
  const handleNameSubmit = useCallback(async (name: string) => {
    if (!activeTab.currentPath) return;
    if (nameModal.mode === 'folder') {
      await FileService.createFolder(activeTab.currentPath, name);
    } else {
      await FileService.createFile(activeTab.currentPath, name, '');
    }
    const updated = await FileService.listDirectory(activeTab.currentPath, { showHidden });
    setDirResult(updated);
    const createdItem = updated.items.find(i => i.name.toLowerCase() === name.toLowerCase());
    if (createdItem) {
      setSelectedItem(createdItem);
    }
  }, [activeTab.currentPath, nameModal.mode, showHidden]);

  // Global Keyboard Shortcuts (Ctrl+Shift+N for New Folder)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'N' || e.key === 'n')) {
        e.preventDefault();
        handleCreateFolder();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleCreateFolder]);

  // Rename Item
  const handleRenameSubmit = async (item: FileItem, newName: string) => {
    setRenamingItem(null);
    if (!newName || newName === item.name) return;
    try {
      const parent = item.path.substring(0, item.path.lastIndexOf('\\'));
      const newPath = `${parent}\\${newName}`;
      await FileService.renameItem(item.path, newPath);
      loadDirectory(activeTab.currentPath);
    } catch (err: any) {
      alert(`Rename error: ${err.message}`);
    }
  };

  // Delete Item (Move to Recycle Bin)
  const handleDeleteItem = useCallback(async (item: FileItem) => {
    const confirmed = confirm(`Move "${item.name}" to Windows Recycle Bin?`);
    if (confirmed) {
      try {
        await FileService.deleteItem(item.path);
        loadDirectory(activeTab.currentPath);
      } catch (err: any) {
        alert(`Failed to delete: ${err.message}`);
      }
    }
  }, [activeTab.currentPath, loadDirectory]);

  // Tagging
  const handleSetTag = async (color: TagColor | null) => {
    if (!selectedItem) return;
    try {
      await FileService.setTag(selectedItem.path, color);
      loadDirectory(activeTab.currentPath);
      setSelectedItem({ ...selectedItem, tag: color });
    } catch (err) {
      console.error('Failed to set tag:', err);
    }
  };

  // Filter & Sort Items
  const processedItems = useMemo(() => {
    let list = [...dirResult.items];

    // Filter by tag
    if (selectedTag) {
      list = list.filter((item) => item.tag === selectedTag);
    }

    // Filter by search
    if (activeTab.searchQuery.trim()) {
      const q = activeTab.searchQuery.toLowerCase();
      list = list.filter((item) => item.name.toLowerCase().includes(q));
    }

    // Sort items
    list.sort((a, b) => {
      // Keep folders on top like macOS Finder
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;

      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
          break;
        case 'date':
          comparison = (a.mtime || 0) - (b.mtime || 0);
          break;
        case 'size':
          comparison = (a.size || 0) - (b.size || 0);
          break;
        case 'kind':
          comparison = (a.extension || '').localeCompare(b.extension || '');
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return list;
  }, [dirResult.items, selectedTag, activeTab.searchQuery, sortField, sortDirection]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (selectedItem) {
          setQuickLookItem((prev) => (prev ? null : selectedItem));
        }
      } else if (e.key === 'Enter') {
        if (selectedItem) {
          handleOpenItem(selectedItem);
        }
      } else if (e.key === 'Backspace') {
        handleGoBack();
      } else if (e.ctrlKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        handleNewTab();
      } else if (e.ctrlKey && e.key.toLowerCase() === 'w') {
        e.preventDefault();
        handleCloseTab(activeTabId);
      } else if (e.ctrlKey && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        if (selectedItem) setGetInfoItem(selectedItem);
      } else if (e.key === 'Delete') {
        if (selectedItem) handleDeleteItem(selectedItem);
      } else if (e.key === 'F2') {
        if (selectedItem) setRenamingItem(selectedItem);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem, activeTabId, handleGoBack, handleNewTab, handleCloseTab, handleOpenItem, handleDeleteItem]);

  // Find drive info for status bar
  const activeDrive = drives.find((d) => activeTab.currentPath.toLowerCase().startsWith(d.mount.toLowerCase()));

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden ${isDarkMode ? 'dark' : ''}`}>
      <div className="flex-1 flex h-full overflow-hidden bg-white dark:bg-[#1e1e20] text-gray-900 dark:text-gray-100 antialiased font-sans">

        {/* macOS Left Sidebar */}
        <Sidebar
          currentPath={activeTab.currentPath}
          onNavigate={navigateTo}
          places={places}
          drives={drives}
          selectedTag={selectedTag}
          onSelectTag={setSelectedTag}
          width={sidebarWidth}
          onResize={setSidebarWidth}
          onOpenAbout={() => setShowAboutModal(true)}
        />

        {/* Main Window Pane */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-white/95 dark:bg-[#1e1e20]/95 backdrop-blur-2xl">
          {/* Top macOS Toolbar */}
          <Toolbar
            canGoBack={activeTab.historyIndex > 0}
            canGoForward={activeTab.historyIndex < activeTab.history.length - 1}
            onGoBack={handleGoBack}
            onGoForward={handleGoForward}
            currentPath={activeTab.currentPath}
            viewMode={activeTab.viewMode}
            onViewModeChange={handleViewModeChange}
            sortField={sortField}
            sortDirection={sortDirection}
            onSortChange={(f, d) => {
              setSortField(f);
              setSortDirection(d);
            }}
            showHidden={showHidden}
            onToggleHidden={handleToggleHidden}
            isDarkMode={isDarkMode}
            onToggleDarkMode={handleToggleDarkMode}
            isInspectorOpen={!!getInfoItem}
            onToggleInspector={() => {
              if (selectedItem) setGetInfoItem(selectedItem);
            }}
            searchQuery={activeTab.searchQuery}
            onSearchChange={handleSearchChange}
            onCreateFolder={handleCreateFolder}
            onCreateFile={handleCreateFile}
          />

          {/* Tab Bar (if more than 1 tab open) */}
          <TabBar
            tabs={tabs}
            activeTabId={activeTabId}
            onSelectTab={setActiveTabId}
            onCloseTab={handleCloseTab}
            onNewTab={handleNewTab}
          />

          {/* Central Active View Pane */}
          <div
            onContextMenu={(e) => {
              if (e.target === e.currentTarget) {
                setContextMenu({ x: e.clientX, y: e.clientY, item: null });
              }
            }}
            className="flex-1 flex overflow-hidden relative"
          >
            {loading && (
              <div className="absolute top-2 right-3 z-30 flex items-center space-x-1.5 px-2 py-1 rounded bg-black/5 dark:bg-white/10 backdrop-blur text-[10px] text-gray-500 dark:text-gray-400">
                <div className="w-2.5 h-2.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span>Loading...</span>
              </div>
            )}
            {activeTab.viewMode === 'icons' && (
              <IconsView
                items={processedItems}
                selectedItem={selectedItem}
                onSelectItem={setSelectedItem}
                onOpenItem={handleOpenItem}
                onContextMenu={(e, item) => setContextMenu({ x: e.clientX, y: e.clientY, item })}
                iconScale={iconScale}
                renamingItem={renamingItem}
                onRenameSubmit={handleRenameSubmit}
                onCancelRename={() => setRenamingItem(null)}
                errorMessage={dirResult.error}
              />
            )}

            {activeTab.viewMode === 'list' && (
              <ListView
                items={processedItems}
                selectedItem={selectedItem}
                onSelectItem={setSelectedItem}
                onOpenItem={handleOpenItem}
                onContextMenu={(e, item) => setContextMenu({ x: e.clientX, y: e.clientY, item })}
                sortField={sortField}
                sortDirection={sortDirection}
                onSortChange={(f, d) => {
                  setSortField(f);
                  setSortDirection(d);
                }}
                errorMessage={dirResult.error}
              />
            )}

            {activeTab.viewMode === 'columns' && (
              <ColumnsView
                initialPath={activeTab.currentPath}
                showHidden={showHidden}
                onSelectItem={setSelectedItem}
                onOpenItem={handleOpenItem}
                onContextMenu={(e, item) => setContextMenu({ x: e.clientX, y: e.clientY, item })}
                onQuickLook={setQuickLookItem}
              />
            )}

            {activeTab.viewMode === 'gallery' && (
              <GalleryView
                items={processedItems}
                selectedItem={selectedItem}
                errorMessage={dirResult.error}
                onSelectItem={setSelectedItem}
                onOpenItem={handleOpenItem}
                onQuickLook={setQuickLookItem}
                onContextMenu={(e, item) => setContextMenu({ x: e.clientX, y: e.clientY, item })}
              />
            )}
          </div>

          {/* Bottom Breadcrumbs & Status Bar */}
          <PathBar
            currentPath={activeTab.currentPath}
            onNavigate={navigateTo}
            itemCount={processedItems.length}
            freeSpace={activeDrive?.freeSpace}
            totalSpace={activeDrive?.totalSpace}
            viewMode={activeTab.viewMode}
            iconScale={iconScale}
            onIconScaleChange={setIconScale}
          />
        </div>
      </div>

      {/* Quick Look Modal (Spacebar) */}
      {quickLookItem && (
        <QuickLookModal
          item={quickLookItem}
          itemsList={processedItems}
          onClose={() => setQuickLookItem(null)}
          onNavigateItem={setQuickLookItem}
          onOpenWithApp={handleOpenItem}
        />
      )}

      {/* Right-click Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          item={contextMenu.item}
          onClose={() => setContextMenu(null)}
          onOpen={() => { if (contextMenu.item) handleOpenItem(contextMenu.item); }}
          onQuickLook={() => { if (contextMenu.item) setQuickLookItem(contextMenu.item); }}
          onRevealInExplorer={() => { if (contextMenu.item) FileService.showInFolder(contextMenu.item.path); }}
          onCopyPath={() => {
            const targetPath = contextMenu.item ? contextMenu.item.path : activeTab.currentPath;
            navigator.clipboard.writeText(targetPath);
          }}
          onRename={() => { if (contextMenu.item) setRenamingItem(contextMenu.item); }}
          onDelete={() => { if (contextMenu.item) handleDeleteItem(contextMenu.item); }}
          onGetInfo={() => {
            setGetInfoItem(
              contextMenu.item || {
                name: activeTab.title,
                path: activeTab.currentPath,
                isDirectory: true,
                isFile: false,
                size: 0,
                mtime: Date.now(),
                extension: '',
                isHidden: false,
              }
            );
          }}
          onSetTag={handleSetTag}
          onCreateFolder={handleCreateFolder}
          onCreateFile={handleCreateFile}
        />
      )}

      {/* Get Info Inspector Dialog */}
      {getInfoItem && (
        <GetInfoModal
          item={getInfoItem}
          onClose={() => setGetInfoItem(null)}
          onSetTag={handleSetTag}
        />
      )}

      {/* Name Entry Modal for New Folder & New File */}
      {nameModal.isOpen && (
        <NameEntryModal
          isOpen={nameModal.isOpen}
          mode={nameModal.mode}
          currentPath={activeTab.currentPath}
          existingNames={dirResult.items.map((i) => i.name)}
          onClose={() => setNameModal((prev) => ({ ...prev, isOpen: false }))}
          onSubmit={handleNameSubmit}
        />
      )}

      {/* About Rove Modal */}
      {showAboutModal && (
        <AboutModal
          onClose={() => setShowAboutModal(false)}
        />
      )}
    </div>
  );
};

export default App;
