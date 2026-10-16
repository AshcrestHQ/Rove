import React from 'react';
import { ChevronRight, HardDrive, Folder } from 'lucide-react';
import type { ViewMode } from '../types/finder';

interface PathBarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  itemCount: number;
  freeSpace?: number | null;
  totalSpace?: number | null;
  viewMode: ViewMode;
  iconScale: number;
  onIconScaleChange: (scale: number) => void;
}

export const PathBar: React.FC<PathBarProps> = ({
  currentPath,
  onNavigate,
  itemCount,
  freeSpace,
  viewMode,
  iconScale,
  onIconScaleChange,
}) => {
  // Parse path into segments
  const segments: { name: string; path: string }[] = [];
  const normalized = currentPath.replace(/\//g, '\\');
  const parts = normalized.split('\\').filter(Boolean);

  let accumulated = '';
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (i === 0 && part.includes(':')) {
      accumulated = `${part}\\`;
    } else {
      accumulated = accumulated ? `${accumulated.replace(/\\$/, '')}\\${part}` : part;
    }
    segments.push({ name: part, path: accumulated });
  }

  const formatSize = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    if (gb >= 1) return `${gb.toFixed(1)} GB`;
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(0)} MB`;
  };

  return (
    <div className="h-7 bg-[#f6f6f6]/95 dark:bg-[#1e1e20]/95 border-t border-gray-200/80 dark:border-white/10 px-3 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 select-none backdrop-blur-md z-15">
      {/* Path Breadcrumbs */}
      <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar max-w-[65%]">
        {segments.map((seg, idx) => {
          const isLast = idx === segments.length - 1;
          const isDrive = seg.name.includes(':');

          return (
            <React.Fragment key={seg.path}>
              {idx > 0 && <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />}
              <button
                onClick={() => onNavigate(seg.path)}
                className={`flex items-center space-x-1 px-1.5 py-0.5 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors whitespace-nowrap ${
                  isLast ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {isDrive ? (
                  <HardDrive className="w-3 h-3 text-gray-600 dark:text-gray-300 mr-1" />
                ) : (
                  <Folder className="w-3 h-3 text-blue-500 mr-1" />
                )}
                <span>{seg.name}</span>
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* Right side: Item count & optional icon scale slider */}
      <div className="flex items-center space-x-4 shrink-0">
        <div className="flex items-center space-x-2">
          <span>{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
          {freeSpace != null && (
            <>
              <span>•</span>
              <span>{formatSize(freeSpace)} available</span>
            </>
          )}
        </div>

        {viewMode === 'icons' && (
          <div className="flex items-center space-x-1.5 pl-2 border-l border-gray-300 dark:border-white/15">
            <span className="text-[10px] text-gray-400">Aa</span>
            <input
              type="range"
              min="0.7"
              max="1.5"
              step="0.1"
              value={iconScale}
              onChange={(e) => onIconScaleChange(parseFloat(e.target.value))}
              className="w-16 h-1 bg-gray-300 dark:bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <span className="text-xs text-gray-400">AA</span>
          </div>
        )}
      </div>
    </div>
  );
};
