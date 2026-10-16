import type { FileItem, SortDirection, SortField } from '../../types/finder';
import { FileIcon } from '../FileIcon';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface ListViewProps {
  items: FileItem[];
  selectedItem: FileItem | null;
  onSelectItem: (item: FileItem) => void;
  onOpenItem: (item: FileItem) => void;
  onContextMenu: (e: React.MouseEvent, item: FileItem) => void;
  sortField: SortField;
  sortDirection: SortDirection;
  onSortChange: (field: SortField, direction: SortDirection) => void;
  errorMessage?: string;
}

export const ListView: React.FC<ListViewProps> = ({
  items,
  selectedItem,
  onSelectItem,
  onOpenItem,
  onContextMenu,
  sortField,
  sortDirection,
  onSortChange,
  errorMessage,
}) => {
  const formatDate = (ms: number) => {
    if (!ms) return '--';
    const d = new Date(ms);
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatSize = (bytes: number, isDir: boolean) => {
    if (isDir) return '--';
    if (bytes === 0) return '0 B';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(0)} KB`;
    const mb = kb / 1024;
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    const gb = mb / 1024;
    return `${gb.toFixed(1)} GB`;
  };

  const getKind = (item: FileItem) => {
    if (item.isDirectory) return 'Folder';
    const ext = item.extension.toLowerCase();
    switch (ext) {
      case 'png': case 'jpg': case 'jpeg': case 'svg': case 'webp': return `${ext.toUpperCase()} Image`;
      case 'pdf': return 'PDF Document';
      case 'txt': case 'md': return 'Text Document';
      case 'ts': case 'tsx': return 'TypeScript Source';
      case 'js': case 'jsx': return 'JavaScript Source';
      case 'json': return 'JSON Document';
      case 'zip': case 'rar': case '7z': return 'Archive';
      case 'exe': case 'msi': return 'Application';
      case 'mp3': case 'wav': return 'Audio File';
      case 'mp4': case 'mkv': return 'Video File';
      default: return ext ? `${ext.toUpperCase()} File` : 'Document';
    }
  };

  const handleHeaderClick = (field: SortField) => {
    if (sortField === field) {
      onSortChange(field, sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      onSortChange(field, 'asc');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden select-none">
      {/* Header Row */}
      <div className="h-7 bg-[#f2f2f3] dark:bg-[#252528] border-b border-gray-200 dark:border-white/10 flex items-center text-[11px] font-semibold text-gray-500 dark:text-gray-400 px-3 shrink-0">
        <button
          onClick={() => handleHeaderClick('name')}
          className="flex-1 flex items-center space-x-1 text-left hover:text-gray-900 dark:hover:text-white"
        >
          <span>Name</span>
          {sortField === 'name' && (
            sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
          )}
        </button>

        <button
          onClick={() => handleHeaderClick('date')}
          className="w-44 flex items-center space-x-1 text-left hover:text-gray-900 dark:hover:text-white"
        >
          <span>Date Modified</span>
          {sortField === 'date' && (
            sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
          )}
        </button>

        <button
          onClick={() => handleHeaderClick('size')}
          className="w-24 flex items-center space-x-1 text-right justify-end hover:text-gray-900 dark:hover:text-white pr-4"
        >
          <span>Size</span>
          {sortField === 'size' && (
            sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
          )}
        </button>

        <button
          onClick={() => handleHeaderClick('kind')}
          className="w-36 flex items-center space-x-1 text-left hover:text-gray-900 dark:hover:text-white"
        >
          <span>Kind</span>
          {sortField === 'kind' && (
            sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
          )}
        </button>
      </div>

      {/* Items List */}
      <div
        onClick={() => onSelectItem(null as any)}
        className="flex-1 overflow-y-auto"
      >
        {items.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-500 py-16 px-4 text-center text-xs">
            {errorMessage || 'Folder is empty'}
          </div>
        ) : (
          items.map((item, index) => {
            const isSelected = selectedItem?.path === item.path;
            const isEven = index % 2 === 0;

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
                className={`h-7.5 flex items-center px-3 text-xs cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-[#007aff] text-white font-medium shadow-sm'
                    : isEven
                    ? 'bg-transparent hover:bg-black/5 dark:hover:bg-white/5 text-gray-800 dark:text-gray-200'
                    : 'bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/5 dark:hover:bg-white/5 text-gray-800 dark:text-gray-200'
                } ${!isSelected && item.isHidden ? 'opacity-60' : ''}`}
              >
                {/* Name & Icon */}
                <div className="flex-1 flex items-center space-x-2 truncate pr-2">
                  <FileIcon
                    name={item.name}
                    isDirectory={item.isDirectory}
                    extension={item.extension}
                    size="sm"
                    tag={item.tag}
                  />
                  <span className="truncate">{item.name}</span>
                </div>

                {/* Date Modified */}
                <div className={`w-44 truncate text-[11px] ${isSelected ? 'text-white/90' : 'text-gray-500 dark:text-gray-400'}`}>
                  {formatDate(item.mtime)}
                </div>

                {/* Size */}
                <div className={`w-24 text-right pr-4 text-[11px] ${isSelected ? 'text-white/90' : 'text-gray-500 dark:text-gray-400'}`}>
                  {formatSize(item.size, item.isDirectory)}
                </div>

                {/* Kind */}
                <div className={`w-36 truncate text-[11px] ${isSelected ? 'text-white/90' : 'text-gray-500 dark:text-gray-400'}`}>
                  {getKind(item)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
