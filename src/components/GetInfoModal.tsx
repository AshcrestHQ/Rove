import type { FileItem, TagColor } from '../types/finder';
import { FileIcon } from './FileIcon';
import { X, Check } from 'lucide-react';

interface GetInfoModalProps {
  item: FileItem | null;
  onClose: () => void;
  onSetTag: (color: TagColor | null) => void;
}

export const GetInfoModal: React.FC<GetInfoModalProps> = ({
  item,
  onClose,
  onSetTag,
}) => {
  if (!item) return null;

  const tagColors: { id: TagColor; color: string }[] = [
    { id: 'red', color: '#ff453a' },
    { id: 'orange', color: '#ff9f0a' },
    { id: 'yellow', color: '#ffd60a' },
    { id: 'green', color: '#30d158' },
    { id: 'blue', color: '#0a84ff' },
    { id: 'purple', color: '#bf5af2' },
    { id: 'gray', color: '#98989d' },
  ];

  const formatDate = (ms?: number) => {
    if (!ms) return '--';
    return new Date(ms).toLocaleString();
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return 'Zero bytes';
    const kb = (bytes / 1024).toFixed(1);
    const mb = (bytes / (1024 * 1024)).toFixed(2);
    return `${bytes.toLocaleString()} bytes (${bytes > 1024 * 1024 ? `${mb} MB` : `${kb} KB`} on disk)`;
  };

  const parentFolder = item.path.substring(0, item.path.lastIndexOf('\\'));

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-pop select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white dark:bg-[#252528] rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 flex flex-col overflow-hidden text-xs text-gray-700 dark:text-gray-200"
      >
        {/* Header */}
        <div className="h-10 bg-gray-100/90 dark:bg-[#2e2e32] border-b border-gray-200 dark:border-white/10 flex items-center justify-between px-3.5">
          <span className="font-semibold text-gray-800 dark:text-gray-100 truncate">
            {item.name} Info
          </span>
          <button
            onClick={onClose}
            className="w-4 h-4 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white"
          >
            <X className="w-2.5 h-2.5 stroke-[2.5]" />
          </button>
        </div>

        {/* Top identity banner */}
        <div className="p-4 flex items-center space-x-3 border-b border-gray-100 dark:border-white/5">
          <FileIcon
            name={item.name}
            isDirectory={item.isDirectory}
            extension={item.extension}
            size="lg"
            tag={item.tag}
          />
          <div className="flex-1 truncate">
            <h4 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
              {item.name}
            </h4>
            <p className="text-gray-400 text-[11px] mt-0.5">
              Modified: {formatDate(item.mtime)}
            </p>
          </div>
        </div>

        {/* General Info */}
        <div className="p-4 space-y-2.5 border-b border-gray-100 dark:border-white/5">
          <div className="font-semibold text-[11px] text-gray-400 uppercase tracking-wider mb-2">
            General
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Kind:</span>
            <span className="font-medium text-right">
              {item.isDirectory ? 'Folder' : `${item.extension.toUpperCase()} Document`}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Size:</span>
            <span className="font-mono text-right">{formatSize(item.size)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Where:</span>
            <span className="truncate max-w-[220px] text-right font-mono text-[10px]" title={parentFolder}>
              {parentFolder}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Created:</span>
            <span className="text-right">{formatDate(item.birthtime || item.mtime)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Modified:</span>
            <span className="text-right">{formatDate(item.mtime)}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="p-4">
          <div className="font-semibold text-[11px] text-gray-400 uppercase tracking-wider mb-2">
            Tags
          </div>
          <div className="flex items-center space-x-2">
            {tagColors.map((t) => (
              <button
                key={t.id}
                onClick={() => onSetTag(item.tag === t.id ? null : t.id)}
                className={`w-5 h-5 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${
                  item.tag === t.id ? 'ring-2 ring-blue-500 scale-110 shadow-sm' : ''
                }`}
                style={{ backgroundColor: t.color }}
              >
                {item.tag === t.id && <Check className="w-3 h-3 text-white stroke-[3]" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
