import React, { useEffect, useState } from 'react';
import type { FileItem, FilePreview } from '../../types/finder';
import { FileIcon } from '../FileIcon';
import { FileService } from '../../services/fileService';
import { ChevronLeft, ChevronRight, Eye, ExternalLink, AlertCircle } from 'lucide-react';

interface GalleryViewProps {
  items: FileItem[];
  selectedItem: FileItem | null;
  errorMessage?: string;
  onSelectItem: (item: FileItem) => void;
  onOpenItem: (item: FileItem) => void;
  onQuickLook: (item: FileItem) => void;
  onContextMenu: (e: React.MouseEvent, item: FileItem) => void;
}

export const GalleryView: React.FC<GalleryViewProps> = ({
  items,
  selectedItem,
  errorMessage,
  onSelectItem,
  onOpenItem,
  onQuickLook,
  onContextMenu,
}) => {
  const [preview, setPreview] = useState<FilePreview | null>(null);

  // Default to first item if none selected
  const activeItem = selectedItem || items[0] || null;

  useEffect(() => {
    let isMounted = true;
    if (activeItem && !activeItem.isDirectory) {
      FileService.readFilePreview(activeItem.path).then((res) => {
        if (isMounted) setPreview(res);
      });
    } else {
      setPreview(null);
    }
    return () => { isMounted = false; };
  }, [activeItem]);

  const currentIndex = items.findIndex((i) => i.path === activeItem?.path);

  const handlePrev = () => {
    if (currentIndex > 0) {
      onSelectItem(items[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      onSelectItem(items[currentIndex + 1]);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(0)} KB`;
    const mb = kb / 1024;
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    return `${(mb / 1024).toFixed(1)} GB`;
  };

  if (errorMessage) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center select-none bg-[#f8f9fa] dark:bg-[#1a1a1c]">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center mb-3">
          <AlertCircle className="w-6 h-6 text-amber-500" />
        </div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 max-w-sm mb-1">{errorMessage}</p>
        <p className="text-xs text-gray-400">Windows restricted access or reparse point target is unavailable.</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-xs">
        No items in folder
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8f9fa] dark:bg-[#1a1a1c] select-none overflow-hidden">
      {/* Main Center Stage Preview */}
      <div className="flex-1 relative flex items-center justify-center p-6 overflow-hidden">
        {/* Navigation arrow buttons */}
        <button
          onClick={handlePrev}
          disabled={currentIndex <= 0}
          className="absolute left-4 p-2 rounded-full bg-white/70 dark:bg-black/50 backdrop-blur border border-black/5 dark:border-white/10 text-gray-700 dark:text-gray-200 disabled:opacity-20 hover:scale-105 active:scale-95 transition-all shadow-md z-10"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={handleNext}
          disabled={currentIndex >= items.length - 1}
          className="absolute right-4 p-2 rounded-full bg-white/70 dark:bg-black/50 backdrop-blur border border-black/5 dark:border-white/10 text-gray-700 dark:text-gray-200 disabled:opacity-20 hover:scale-105 active:scale-95 transition-all shadow-md z-10"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Selected Item Presentation */}
        {activeItem && (
          <div className="flex flex-col items-center max-w-xl max-h-full">
            {/* If Image with dataUrl */}
            {preview?.type === 'image' && preview.dataUrl ? (
              <img
                src={preview.dataUrl}
                alt={activeItem.name}
                className="max-h-[340px] max-w-full rounded-lg shadow-xl object-contain ring-1 ring-black/10"
              />
            ) : preview?.type === 'text' && preview.content ? (
              <div className="w-full max-h-[300px] overflow-y-auto p-4 bg-white dark:bg-[#252528] rounded-lg shadow-lg border border-gray-200 dark:border-white/10 font-mono text-xs text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                {preview.content.slice(0, 1500)}
              </div>
            ) : (
              <div className="p-8">
                <FileIcon
                  name={activeItem.name}
                  isDirectory={activeItem.isDirectory}
                  extension={activeItem.extension}
                  size="xl"
                  tag={activeItem.tag}
                />
              </div>
            )}

            {/* Title and metadata */}
            <div className="mt-4 text-center">
              <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate max-w-md">
                {activeItem.name}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {activeItem.isDirectory ? 'Folder' : `${activeItem.extension.toUpperCase()} • ${formatSize(activeItem.size)}`}
              </p>

              <div className="flex items-center justify-center space-x-2 mt-3">
                <button
                  onClick={() => onQuickLook(activeItem)}
                  className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-xs font-medium flex items-center space-x-1.5 shadow-sm transition-all"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Quick Look</span>
                </button>
                <button
                  onClick={() => onOpenItem(activeItem)}
                  className="px-3 py-1 bg-black/5 dark:bg-white/10 hover:bg-black/10 text-gray-800 dark:text-gray-200 rounded-md text-xs font-medium flex items-center space-x-1.5 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Filmstrip Carousel */}
      <div className="h-28 bg-[#eeeff1] dark:bg-[#202022] border-t border-gray-200 dark:border-white/10 px-4 py-2 flex items-center space-x-2 overflow-x-auto">
        {items.map((item) => {
          const isSelected = item.path === activeItem?.path;

          return (
            <div
              key={item.path}
              onClick={() => onSelectItem(item)}
              onDoubleClick={() => onOpenItem(item)}
              onContextMenu={(e) => {
                onSelectItem(item);
                onContextMenu(e, item);
              }}
              className={`flex flex-col items-center justify-center w-20 h-22 rounded-lg cursor-pointer shrink-0 p-1.5 transition-all ${
                item.isHidden ? 'opacity-60' : ''
              } ${
                isSelected
                  ? 'bg-blue-500/15 ring-2 ring-blue-500 shadow-sm'
                  : 'hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <FileIcon
                name={item.name}
                isDirectory={item.isDirectory}
                extension={item.extension}
                size="md"
                tag={item.tag}
              />
              <span className={`text-[10px] mt-1 text-center truncate w-full ${
                isSelected ? 'font-semibold text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
              }`}>
                {item.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
