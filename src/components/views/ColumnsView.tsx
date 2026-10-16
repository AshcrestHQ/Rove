import React, { useState, useEffect, useRef } from 'react';
import type { FileItem, TagColor } from '../../types/finder';
import { FileIcon } from '../FileIcon';
import { ChevronRight, Eye, ExternalLink } from 'lucide-react';
import { FileService } from '../../services/fileService';

interface ColumnData {
  path: string;
  items: FileItem[];
  selectedItem: FileItem | null;
}

interface ColumnsViewProps {
  initialPath: string;
  showHidden?: boolean;
  onSelectItem: (item: FileItem) => void;
  onOpenItem: (item: FileItem) => void;
  onContextMenu: (e: React.MouseEvent, item: FileItem) => void;
  onQuickLook: (item: FileItem) => void;
}

export const ColumnsView: React.FC<ColumnsViewProps> = ({
  initialPath,
  showHidden = false,
  onSelectItem,
  onOpenItem,
  onContextMenu,
  onQuickLook,
}) => {
  const [columns, setColumns] = useState<ColumnData[]>([]);
  const [previewItem, setPreviewItem] = useState<FileItem | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const columnsRef = useRef<ColumnData[]>([]);
  useEffect(() => {
    columnsRef.current = columns;
  }, [columns]);
  const initialPathRef = useRef(initialPath);

  // Synchronize columns on initialPath change or showHidden toggle
  useEffect(() => {
    let isMounted = true;
    const isPathChange = initialPathRef.current !== initialPath;
    initialPathRef.current = initialPath;

    async function updateColumns() {
      try {
        if (isPathChange || columnsRef.current.length === 0) {
          const res = await FileService.listDirectory(initialPath, { showHidden });
          if (isMounted) {
            setColumns([{ path: initialPath, items: res.items, selectedItem: null }]);
            setPreviewItem(null);
          }
        } else {
          const refreshed = await Promise.all(
            columnsRef.current.map(async (col) => {
              const res = await FileService.listDirectory(col.path, { showHidden });
              return { ...col, items: res.items };
            })
          );
          if (isMounted) {
            setColumns(refreshed);
          }
        }
      } catch (err) {
        console.error('Failed to update columns:', err);
      }
    }

    updateColumns();
    return () => { isMounted = false; };
  }, [initialPath, showHidden]);

  // Handle column item selection
  const handleItemClick = async (colIndex: number, item: FileItem) => {
    onSelectItem(item);

    const updatedCols = [...columns.slice(0, colIndex + 1)];
    updatedCols[colIndex].selectedItem = item;

    if (item.isDirectory) {
      setPreviewItem(null);
      try {
        const childRes = await FileService.listDirectory(item.path, { showHidden });
        updatedCols.push({
          path: item.path,
          items: childRes.items,
          selectedItem: null,
        });
        setColumns(updatedCols);
      } catch (e) {
        console.error('Failed to load child directory:', e);
      }
    } else {
      // File selected: display preview inspector column
      setPreviewItem(item);
      setColumns(updatedCols);
    }

    // Auto-scroll to right
    setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.scrollLeft = containerRef.current.scrollWidth;
      }
    }, 50);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(0)} KB`;
    const mb = kb / 1024;
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    return `${(mb / 1024).toFixed(1)} GB`;
  };

  const formatDate = (ms: number) => {
    if (!ms) return '--';
    return new Date(ms).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const tagColors: { id: TagColor; color: string }[] = [
    { id: 'red', color: '#ff453a' },
    { id: 'orange', color: '#ff9f0a' },
    { id: 'yellow', color: '#ffd60a' },
    { id: 'green', color: '#30d158' },
    { id: 'blue', color: '#0a84ff' },
    { id: 'purple', color: '#bf5af2' },
    { id: 'gray', color: '#98989d' },
  ];

  return (
    <div
      ref={containerRef}
      className="flex-1 flex h-full overflow-x-auto overflow-y-hidden select-none bg-white dark:bg-[#1c1c1e]"
    >
      {/* Cascading Columns */}
      {columns.map((col, colIdx) => (
        <div
          key={col.path + colIdx}
          className="w-64 min-w-[240px] max-w-[280px] h-full border-r border-gray-200/80 dark:border-white/10 flex flex-col shrink-0 bg-white dark:bg-[#1c1c1e]"
        >
          <div className="flex-1 overflow-y-auto p-1 space-y-0.5">
            {col.items.length === 0 ? (
              <div className="p-4 text-center text-gray-400 text-xs">Empty</div>
            ) : (
              col.items.map((item) => {
                const isSelected = col.selectedItem?.path === item.path;

                return (
                  <div
                    key={item.path}
                    onClick={() => handleItemClick(colIdx, item)}
                    onDoubleClick={() => onOpenItem(item)}
                    onContextMenu={(e) => {
                      onSelectItem(item);
                      onContextMenu(e, item);
                    }}
                    className={`h-7 px-2 rounded-md flex items-center justify-between text-xs cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#007aff] text-white font-medium shadow-sm'
                        : 'hover:bg-black/5 dark:hover:bg-white/5 text-gray-800 dark:text-gray-200'
                    } ${!isSelected && item.isHidden ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-center space-x-2 truncate mr-1">
                      <FileIcon
                        name={item.name}
                        isDirectory={item.isDirectory}
                        extension={item.extension}
                        size="sm"
                        tag={item.tag}
                      />
                      <span className="truncate">{item.name}</span>
                    </div>

                    {item.isDirectory && (
                      <ChevronRight
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isSelected ? 'text-white/80' : 'text-gray-400'
                        }`}
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      ))}

      {/* Rightmost Inspector Preview Column when file is selected */}
      {previewItem && (
        <div className="w-80 min-w-[280px] h-full border-r border-gray-200/80 dark:border-white/10 p-5 flex flex-col items-center justify-between shrink-0 bg-[#fafafa] dark:bg-[#202022] overflow-y-auto">
          <div className="w-full flex flex-col items-center">
            {/* Large Preview Icon */}
            <div className="my-4">
              <FileIcon
                name={previewItem.name}
                isDirectory={previewItem.isDirectory}
                extension={previewItem.extension}
                size="xl"
                tag={previewItem.tag}
              />
            </div>

            {/* Name */}
            <div className="text-center font-medium text-sm text-gray-900 dark:text-white break-words max-w-full px-2 mb-1">
              {previewItem.name}
            </div>

            {/* Kind & Size */}
            <div className="text-center text-xs text-gray-400 mb-6">
              {previewItem.extension ? `${previewItem.extension.toUpperCase()} Document` : 'Document'} • {formatSize(previewItem.size)}
            </div>

            {/* Metadata Table */}
            <div className="w-full space-y-2.5 text-xs border-t border-b border-gray-200 dark:border-white/10 py-3 text-gray-600 dark:text-gray-300">
              <div className="flex justify-between">
                <span className="text-gray-400">Created</span>
                <span className="font-mono text-[11px]">{formatDate(previewItem.birthtime || previewItem.mtime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Modified</span>
                <span className="font-mono text-[11px]">{formatDate(previewItem.mtime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Size</span>
                <span className="font-mono text-[11px]">{formatSize(previewItem.size)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Tags</span>
                <div className="flex space-x-1.5">
                  {tagColors.map((t) => (
                    <button
                      key={t.id}
                      onClick={async () => {
                        const newTag = previewItem.tag === t.id ? null : t.id;
                        await FileService.setTag(previewItem.path, newTag);
                        setPreviewItem({ ...previewItem, tag: newTag });
                      }}
                      className={`w-3.5 h-3.5 rounded-full ring-offset-1 transition-all ${
                        previewItem.tag === t.id ? 'ring-2 ring-blue-500 scale-110' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: t.color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full space-y-2 mt-4">
            <button
              onClick={() => onQuickLook(previewItem)}
              className="w-full py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg flex items-center justify-center space-x-1.5 shadow-sm transition-all active:scale-98"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Quick Look (Space)</span>
            </button>
            <button
              onClick={() => onOpenItem(previewItem)}
              className="w-full py-1.5 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/15 text-gray-800 dark:text-gray-200 text-xs font-medium rounded-lg flex items-center justify-center space-x-1.5 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in Default App</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
