import React, { useState } from 'react';
import type { FileItem } from '../../types/finder';
import { FileIcon } from '../FileIcon';

interface IconsViewProps {
  items: FileItem[];
  selectedItem: FileItem | null;
  onSelectItem: (item: FileItem) => void;
  onOpenItem: (item: FileItem) => void;
  onContextMenu: (e: React.MouseEvent, item: FileItem) => void;
  iconScale: number;
  renamingItem: FileItem | null;
  onRenameSubmit: (item: FileItem, newName: string) => void;
  onCancelRename: () => void;
  errorMessage?: string;
}

export const IconsView: React.FC<IconsViewProps> = ({
  items,
  selectedItem,
  onSelectItem,
  onOpenItem,
  onContextMenu,
  iconScale,
  renamingItem,
  onRenameSubmit,
  onCancelRename,
  errorMessage,
}) => {
  const [tempName, setTempName] = useState('');

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '--';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(0)} KB`;
    const mb = kb / 1024;
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    const gb = mb / 1024;
    return `${gb.toFixed(1)} GB`;
  };

  return (
    <div
      onClick={() => onSelectItem(null as any)}
      className="flex-1 overflow-y-auto p-4 select-none"
    >
      {items.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 py-20 px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-3">
            <span className="text-2xl">{errorMessage ? '⚠️' : '📁'}</span>
          </div>
          <p className="text-sm font-medium">{errorMessage || 'This folder is empty'}</p>
        </div>
      ) : (
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: `repeat(auto-fill, minmax(${Math.round(92 * iconScale)}px, 1fr))`
          }}
        >
          {items.map((item) => {
            const isSelected = selectedItem?.path === item.path;
            const isRenaming = renamingItem?.path === item.path;

            return (
              <div
                key={item.path}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectItem(item);
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  onOpenItem(item);
                }}
                onContextMenu={(e) => {
                  e.stopPropagation();
                  onSelectItem(item);
                  onContextMenu(e, item);
                }}
                className={`group flex flex-col items-center p-2 rounded-lg cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-blue-500/15 ring-1 ring-blue-500/50 dark:bg-blue-600/25'
                    : 'hover:bg-black/5 dark:hover:bg-white/5'
                } ${!isSelected && item.isHidden ? 'opacity-60' : ''}`}
              >
                {/* File Icon */}
                <FileIcon
                  name={item.name}
                  isDirectory={item.isDirectory}
                  extension={item.extension}
                  size={iconScale > 1.2 ? 'xl' : 'lg'}
                  tag={item.tag}
                  className="mb-1.5 transition-transform group-hover:scale-105"
                />

                {/* Name / Inline Rename Input */}
                {isRenaming ? (
                  <input
                    type="text"
                    defaultValue={item.name}
                    autoFocus
                    onFocus={(e) => {
                      // Select filename without extension
                      const val = e.target.value;
                      const dotIdx = item.isDirectory ? -1 : val.lastIndexOf('.');
                      e.target.setSelectionRange(0, dotIdx > 0 ? dotIdx : val.length);
                      setTempName(val);
                    }}
                    onChange={(e) => setTempName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        onRenameSubmit(item, tempName || item.name);
                      } else if (e.key === 'Escape') {
                        onCancelRename();
                      }
                    }}
                    onBlur={() => onRenameSubmit(item, tempName || item.name)}
                    className="w-full text-center text-xs px-1 py-0.5 rounded bg-white dark:bg-[#1e1e1e] border border-blue-500 outline-none text-gray-900 dark:text-white shadow-sm"
                  />
                ) : (
                  <div className="w-full text-center">
                    <span
                      className={`text-xs font-normal leading-tight line-clamp-2 px-1 py-0.5 rounded break-words ${
                        isSelected
                          ? 'bg-blue-600 text-white font-medium shadow-sm'
                          : 'text-gray-800 dark:text-gray-200'
                      }`}
                      title={item.name}
                    >
                      {item.name}
                    </span>
                    {!item.isDirectory && (
                      <span className="block text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                        {formatSize(item.size)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
