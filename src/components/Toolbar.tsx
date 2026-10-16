import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List as ListIcon,
  Columns,
  GalleryHorizontal,
  FolderPlus,
  FilePlus,
  ArrowUpDown,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Info,
  Search,
  X,
  Check
} from 'lucide-react';
import type { SortDirection, SortField, ViewMode } from '../types/finder';
import { WindowControls } from './WindowControls';
import { FileService } from '../services/fileService';

interface ToolbarProps {
  canGoBack: boolean;
  canGoForward: boolean;
  onGoBack: () => void;
  onGoForward: () => void;
  currentPath: string;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sortField: SortField;
  sortDirection: SortDirection;
  onSortChange: (field: SortField, direction: SortDirection) => void;
  showHidden: boolean;
  onToggleHidden: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isInspectorOpen: boolean;
  onToggleInspector: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCreateFolder: () => void;
  onCreateFile: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  canGoBack,
  canGoForward,
  onGoBack,
  onGoForward,
  currentPath,
  viewMode,
  onViewModeChange,
  sortField,
  sortDirection,
  onSortChange,
  showHidden,
  onToggleHidden,
  isDarkMode,
  onToggleDarkMode,
  isInspectorOpen,
  onToggleInspector,
  searchQuery,
  onSearchChange,
  onCreateFolder,
  onCreateFile,
}) => {
  const [showSortMenu, setShowSortMenu] = useState(false);
  const sortMenuRef = useRef<HTMLDivElement>(null);

  // Close sort menu on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target as Node)) {
        setShowSortMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentFolderName = currentPath.split('\\').filter(Boolean).pop() || currentPath;

  const viewModes: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
    { id: 'icons', label: 'Icons', icon: <LayoutGrid className="w-3.5 h-3.5" /> },
    { id: 'list', label: 'List', icon: <ListIcon className="w-3.5 h-3.5" /> },
    { id: 'columns', label: 'Columns', icon: <Columns className="w-3.5 h-3.5" /> },
    { id: 'gallery', label: 'Gallery', icon: <GalleryHorizontal className="w-3.5 h-3.5" /> },
  ];

  const sortOptions: { id: SortField; label: string }[] = [
    { id: 'name', label: 'Name' },
    { id: 'date', label: 'Date Modified' },
    { id: 'size', label: 'Size' },
    { id: 'kind', label: 'Kind' },
  ];

  return (
    <div
      onDoubleClick={async () => { await FileService.windowMaximize(); }}
      className="h-13 bg-[#f6f6f6]/90 dark:bg-[#252528]/90 border-b border-gray-200/80 dark:border-white/10 flex items-center justify-between px-3 select-none titlebar-drag backdrop-blur-md z-20"
    >
      {/* Left: Navigation and Folder Title */}
      <div className="flex items-center space-x-2 no-drag">
        {/* Back and Forward buttons */}
        <div className="flex items-center bg-black/5 dark:bg-white/10 rounded-md p-0.5">
          <button
            onClick={onGoBack}
            disabled={!canGoBack}
            title="Back"
            className="p-1 rounded text-gray-700 dark:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
          </button>
          <div className="w-[1px] h-3 bg-gray-300 dark:bg-white/20 my-auto" />
          <button
            onClick={onGoForward}
            disabled={!canGoForward}
            title="Forward"
            className="p-1 rounded text-gray-700 dark:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all"
          >
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Current Folder Title */}
        <div className="flex items-center space-x-1.5 px-2 py-1 max-w-[200px] text-ellipsis overflow-hidden whitespace-nowrap">
          <span className="font-semibold text-[13px] text-gray-800 dark:text-gray-100 truncate">
            {currentFolderName}
          </span>
        </div>
      </div>

      {/* Center: View Switcher (macOS segmented pill) */}
      <div className="flex items-center bg-black/5 dark:bg-white/10 p-0.5 rounded-md no-drag border border-black/5 dark:border-white/5 shadow-inner">
        {viewModes.map((m) => (
          <button
            key={m.id}
            onClick={() => onViewModeChange(m.id)}
            title={m.label}
            className={`px-2.5 py-1 rounded-[5px] flex items-center space-x-1.5 text-xs font-medium transition-all ${
              viewMode === m.id
                ? 'bg-white dark:bg-[#3a3a3c] text-gray-900 dark:text-white shadow-sm font-semibold'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {m.icon}
            <span className="hidden sm:inline">{m.label}</span>
          </button>
        ))}
      </div>

      {/* Right: Actions, Sort, Theme, Inspector & Search */}
      <div className="flex items-center space-x-1.5 no-drag">
        {/* New Folder */}
        <button
          onClick={onCreateFolder}
          title="New Folder (Ctrl+Shift+N)"
          className="p-1.5 rounded-md text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all"
        >
          <FolderPlus className="w-4 h-4" />
        </button>

        {/* New File */}
        <button
          onClick={onCreateFile}
          title="New Text File"
          className="p-1.5 rounded-md text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all"
        >
          <FilePlus className="w-4 h-4" />
        </button>

        {/* Sort Dropdown */}
        <div className="relative" ref={sortMenuRef}>
          <button
            onClick={() => setShowSortMenu(!showSortMenu)}
            title="Sort options"
            className={`p-1.5 rounded-md transition-all ${
              showSortMenu
                ? 'bg-black/10 dark:bg-white/20 text-blue-600'
                : 'text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10'
            }`}
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>

          {showSortMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-[#2c2c2e] rounded-lg shadow-xl border border-gray-200 dark:border-white/10 py-1 z-50 text-xs animate-pop">
              <div className="px-3 py-1 font-semibold text-gray-400 dark:text-gray-400 text-[10px] uppercase tracking-wider">
                Sort By
              </div>
              {sortOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    if (sortField === opt.id) {
                      onSortChange(opt.id, sortDirection === 'asc' ? 'desc' : 'asc');
                    } else {
                      onSortChange(opt.id, 'asc');
                    }
                    setShowSortMenu(false);
                  }}
                  className="w-full px-3 py-1.5 flex items-center justify-between text-left hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 transition-colors"
                >
                  <span>{opt.label}</span>
                  {sortField === opt.id && (
                    <span className="flex items-center space-x-1">
                      <span className="text-[10px] opacity-75">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Show/Hide Hidden Files Toggle */}
        <button
          onClick={onToggleHidden}
          title={showHidden ? 'Hide hidden files' : 'Show hidden files'}
          aria-label={showHidden ? 'Hide hidden files' : 'Show hidden files'}
          aria-pressed={showHidden}
          className={`p-1.5 rounded-md transition-all ${
            showHidden
              ? 'bg-blue-500 text-white shadow-sm ring-1 ring-blue-600/30'
              : 'text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10'
          }`}
        >
          {showHidden ? <Eye className="w-4 h-4 stroke-[2.2]" /> : <EyeOff className="w-4 h-4" />}
        </button>

        {/* Dark / Light Mode */}
        <button
          onClick={onToggleDarkMode}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-1.5 rounded-md text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-gray-700" />}
        </button>

        {/* Toggle Inspector (Get Info) */}
        <button
          onClick={onToggleInspector}
          title="Get Info (Ctrl+I)"
          className={`p-1.5 rounded-md transition-all ${
            isInspectorOpen
              ? 'bg-blue-500 text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10'
          }`}
        >
          <Info className="w-4 h-4" />
        </button>

        {/* Search input */}
        <div className="relative ml-1">
          <div className="flex items-center bg-black/5 dark:bg-white/10 rounded-md px-2 py-1 focus-within:ring-2 focus-within:ring-blue-500 transition-all border border-transparent focus-within:border-blue-500">
            <Search className="w-3.5 h-3.5 text-gray-400 mr-1.5 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search"
              className="bg-transparent border-none outline-none text-xs w-20 sm:w-28 focus:w-40 text-gray-800 dark:text-gray-100 placeholder-gray-400 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Ubuntu / GNOME Window Controls */}
        <div className="w-[1px] h-4 bg-gray-300 dark:bg-white/10 mx-1" />
        <WindowControls />
      </div>
    </div>
  );
};
