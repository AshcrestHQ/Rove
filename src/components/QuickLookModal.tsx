import React, { useEffect, useState } from 'react';
import type { FileItem, FilePreview } from '../types/finder';
import { FileService } from '../services/fileService';
import { FileIcon } from './FileIcon';
import { X, ExternalLink, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

interface QuickLookModalProps {
  item: FileItem | null;
  itemsList: FileItem[];
  onClose: () => void;
  onNavigateItem: (newItem: FileItem) => void;
  onOpenWithApp: (item: FileItem) => void;
}

export const QuickLookModal: React.FC<QuickLookModalProps> = ({
  item,
  itemsList,
  onClose,
  onNavigateItem,
  onOpenWithApp,
}) => {
  const [preview, setPreview] = useState<FilePreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    if (!item) return;

    let isMounted = true;
    setLoading(true);

    FileService.readFilePreview(item.path)
      .then((res) => {
        if (isMounted) {
          setPreview(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setPreview({ type: 'error', message: err.message });
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, [item]);

  // Handle keyboard events (Esc to close, Left/Right arrows to cycle)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' || e.code === 'Space') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const currIdx = itemsList.findIndex((i) => i.path === item?.path);
        if (currIdx > 0) onNavigateItem(itemsList[currIdx - 1]);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const currIdx = itemsList.findIndex((i) => i.path === item?.path);
        if (currIdx < itemsList.length - 1) onNavigateItem(itemsList[currIdx + 1]);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [item, itemsList, onClose, onNavigateItem]);

  if (!item) return null;

  const formatSize = (bytes?: number) => {
    if (!bytes) return '--';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(0)} KB`;
    const mb = kb / 1024;
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    return `${(mb / 1024).toFixed(1)} GB`;
  };

  const currIdx = itemsList.findIndex((i) => i.path === item.path);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/45 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-pop select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[82vh] bg-white/95 dark:bg-[#222225]/95 rounded-2xl shadow-2xl border border-white/20 dark:border-white/10 flex flex-col overflow-hidden backdrop-blur-2xl"
      >
        {/* Header Bar */}
        <div className="h-11 bg-gray-100/80 dark:bg-[#2c2c2e]/80 border-b border-gray-200/80 dark:border-white/10 flex items-center justify-between px-3.5 shrink-0">
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              title="Close (Esc / Space)"
              className="w-4 h-4 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white/90 transition-transform active:scale-90"
            >
              <X className="w-2.5 h-2.5 stroke-[2.5]" />
            </button>
            <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate max-w-sm">
              {item.name}
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            {/* Prev / Next buttons */}
            <div className="flex items-center bg-black/5 dark:bg-white/10 rounded-md p-0.5 mr-2">
              <button
                disabled={currIdx <= 0}
                onClick={() => onNavigateItem(itemsList[currIdx - 1])}
                className="p-1 rounded text-gray-600 dark:text-gray-300 disabled:opacity-30 hover:bg-black/5"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                disabled={currIdx >= itemsList.length - 1}
                onClick={() => onNavigateItem(itemsList[currIdx + 1])}
                className="p-1 rounded text-gray-600 dark:text-gray-300 disabled:opacity-30 hover:bg-black/5"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Open with default app */}
            <button
              onClick={() => onOpenWithApp(item)}
              className="px-2.5 py-1 bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/15 text-gray-700 dark:text-gray-200 text-xs font-medium rounded-md flex items-center space-x-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-auto p-6 flex flex-col items-center justify-center min-h-[300px]">
          {loading ? (
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span>Generating preview...</span>
            </div>
          ) : preview?.type === 'image' && preview.dataUrl ? (
            <div className="relative flex flex-col items-center justify-center max-w-full">
              <img
                src={preview.dataUrl}
                alt={item.name}
                className={`max-h-[55vh] object-contain rounded-lg shadow-md transition-all ${
                  isZoomed ? 'scale-125' : ''
                }`}
              />
              <button
                onClick={() => setIsZoomed(!isZoomed)}
                className="absolute bottom-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors shadow"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : preview?.type === 'text' && preview.content ? (
            <div className="w-full h-full max-h-[58vh] overflow-auto bg-gray-50 dark:bg-[#19191b] rounded-lg p-4 font-mono text-xs text-gray-800 dark:text-gray-200 leading-relaxed border border-gray-200 dark:border-white/10 whitespace-pre-wrap select-text">
              {preview.content}
            </div>
          ) : preview?.type === 'audio' && preview.dataUrl ? (
            <div className="flex flex-col items-center space-y-4">
              <FileIcon name={item.name} isDirectory={false} extension="mp3" size="xl" />
              <audio controls src={preview.dataUrl} className="w-80" autoPlay />
            </div>
          ) : preview?.type === 'video' && preview.url ? (
            <video controls src={preview.url} className="max-h-[55vh] rounded-lg shadow" autoPlay />
          ) : (
            <div className="flex flex-col items-center space-y-3 py-8">
              <FileIcon
                name={item.name}
                isDirectory={item.isDirectory}
                extension={item.extension}
                size="xl"
                tag={item.tag}
              />
              <div className="text-center">
                <p className="font-semibold text-sm text-gray-800 dark:text-gray-100">{item.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {item.isDirectory ? 'Folder' : `${item.extension.toUpperCase()} Document`} • {formatSize(item.size)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="h-8 bg-gray-50 dark:bg-[#202022] border-t border-gray-200/80 dark:border-white/10 px-4 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
          <span>{item.path}</span>
          <span>{formatSize(item.size)}</span>
        </div>
      </div>
    </div>
  );
};
