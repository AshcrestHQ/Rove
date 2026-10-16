import React, { useEffect, useRef } from 'react';
import type { FileItem, TagColor } from '../types/finder';
import {
  Eye,
  ExternalLink,
  FolderSearch,
  Copy,
  Trash2,
  Edit3,
  Info,
  Check,
  X,
  FolderPlus,
  FilePlus
} from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  item: FileItem | null;
  onClose: () => void;
  onOpen: () => void;
  onQuickLook: () => void;
  onRevealInExplorer: () => void;
  onCopyPath: () => void;
  onRename: () => void;
  onDelete: () => void;
  onGetInfo: () => void;
  onSetTag: (color: TagColor | null) => void;
  onCreateFolder?: () => void;
  onCreateFile?: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  item,
  onClose,
  onOpen,
  onQuickLook,
  onRevealInExplorer,
  onCopyPath,
  onRename,
  onDelete,
  onGetInfo,
  onSetTag,
  onCreateFolder,
  onCreateFile,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const tagColors: { id: TagColor; color: string }[] = [
    { id: 'red', color: '#ff453a' },
    { id: 'orange', color: '#ff9f0a' },
    { id: 'yellow', color: '#ffd60a' },
    { id: 'green', color: '#30d158' },
    { id: 'blue', color: '#0a84ff' },
    { id: 'purple', color: '#bf5af2' },
    { id: 'gray', color: '#98989d' },
  ];

  // Keep menu on screen
  const adjustedX = Math.min(x, window.innerWidth - 220);
  const adjustedY = Math.min(y, window.innerHeight - 340);

  // Background context menu (when clicked outside any item)
  if (!item) {
    return (
      <div
        ref={menuRef}
        style={{ left: adjustedX, top: adjustedY }}
        className="fixed z-50 w-52 bg-white/95 dark:bg-[#28282a]/95 backdrop-blur-2xl rounded-xl shadow-2xl border border-gray-200/80 dark:border-white/10 py-1.5 text-xs text-gray-800 dark:text-gray-200 select-none animate-pop font-sans"
      >
        {onCreateFolder && (
          <button
            onClick={() => { onCreateFolder(); onClose(); }}
            className="w-full px-3 py-1.5 flex items-center space-x-2 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 transition-colors"
          >
            <FolderPlus className="w-3.5 h-3.5 text-blue-500 group-hover:text-white" />
            <span>New Folder</span>
          </button>
        )}

        {onCreateFile && (
          <button
            onClick={() => { onCreateFile(); onClose(); }}
            className="w-full px-3 py-1.5 flex items-center space-x-2 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 transition-colors"
          >
            <FilePlus className="w-3.5 h-3.5 text-emerald-500 group-hover:text-white" />
            <span>New Text File</span>
          </button>
        )}

        <div className="h-[1px] bg-gray-200 dark:bg-white/10 my-1" />

        <button
          onClick={() => { onGetInfo(); onClose(); }}
          className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 transition-colors"
        >
          <span className="flex items-center space-x-2">
            <Info className="w-3.5 h-3.5" />
            <span>Folder Info</span>
          </span>
          <span className="text-[10px] opacity-60">Ctrl+I</span>
        </button>
      </div>
    );
  }

  return (
    <div
      ref={menuRef}
      style={{ left: adjustedX, top: adjustedY }}
      className="fixed z-50 w-52 bg-white/95 dark:bg-[#28282a]/95 backdrop-blur-2xl rounded-xl shadow-2xl border border-gray-200/80 dark:border-white/10 py-1.5 text-xs text-gray-800 dark:text-gray-200 select-none animate-pop font-sans"
    >
      <button
        onClick={() => { onOpen(); onClose(); }}
        className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 transition-colors"
      >
        <span className="flex items-center space-x-2">
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Open</span>
        </span>
        <span className="text-[10px] opacity-60">↵</span>
      </button>

      <button
        onClick={() => { onQuickLook(); onClose(); }}
        className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 transition-colors"
      >
        <span className="flex items-center space-x-2">
          <Eye className="w-3.5 h-3.5" />
          <span>Quick Look</span>
        </span>
        <span className="text-[10px] opacity-60">Space</span>
      </button>

      <button
        onClick={() => { onRevealInExplorer(); onClose(); }}
        className="w-full px-3 py-1.5 flex items-center space-x-2 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 transition-colors"
      >
        <FolderSearch className="w-3.5 h-3.5" />
        <span>Reveal in Windows Explorer</span>
      </button>

      <div className="h-[1px] bg-gray-200 dark:bg-white/10 my-1" />

      {onCreateFolder && (
        <button
          onClick={() => { onCreateFolder(); onClose(); }}
          className="w-full px-3 py-1.5 flex items-center space-x-2 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 transition-colors"
        >
          <FolderPlus className="w-3.5 h-3.5" />
          <span>New Folder</span>
        </button>
      )}

      {onCreateFile && (
        <button
          onClick={() => { onCreateFile(); onClose(); }}
          className="w-full px-3 py-1.5 flex items-center space-x-2 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 transition-colors"
        >
          <FilePlus className="w-3.5 h-3.5" />
          <span>New Text File</span>
        </button>
      )}

      <div className="h-[1px] bg-gray-200 dark:bg-white/10 my-1" />

      <button
        onClick={() => { onCopyPath(); onClose(); }}
        className="w-full px-3 py-1.5 flex items-center space-x-2 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 transition-colors"
      >
        <Copy className="w-3.5 h-3.5" />
        <span>Copy Path</span>
      </button>

      <button
        onClick={() => { onRename(); onClose(); }}
        className="w-full px-3 py-1.5 flex items-center space-x-2 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 transition-colors"
      >
        <Edit3 className="w-3.5 h-3.5" />
        <span>Rename</span>
      </button>

      <button
        onClick={() => { onDelete(); onClose(); }}
        className="w-full px-3 py-1.5 flex items-center space-x-2 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5" />
        <span>Move to Recycle Bin</span>
      </button>

      <div className="h-[1px] bg-gray-200 dark:bg-white/10 my-1" />

      {/* Color Tags Selector */}
      <div className="px-3 py-1.5">
        <div className="text-[10px] uppercase font-semibold text-gray-400 dark:text-gray-400 mb-1.5">
          Tags
        </div>
        <div className="flex items-center space-x-1.5">
          {tagColors.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                onSetTag(item.tag === t.id ? null : t.id);
                onClose();
              }}
              title={t.id}
              className={`w-4 h-4 rounded-full flex items-center justify-center transition-transform hover:scale-115 ${
                item.tag === t.id ? 'ring-2 ring-blue-500 scale-110 shadow-sm' : ''
              }`}
              style={{ backgroundColor: t.color }}
            >
              {item.tag === t.id && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
            </button>
          ))}
          {item.tag && (
            <button
              onClick={() => { onSetTag(null); onClose(); }}
              title="Remove tag"
              className="p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-gray-400"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      <div className="h-[1px] bg-gray-200 dark:bg-white/10 my-1" />

      <button
        onClick={() => { onGetInfo(); onClose(); }}
        className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 transition-colors"
      >
        <span className="flex items-center space-x-2">
          <Info className="w-3.5 h-3.5" />
          <span>Get Info</span>
        </span>
        <span className="text-[10px] opacity-60">Ctrl+I</span>
      </button>
    </div>
  );
};
