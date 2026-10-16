import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  HardDrive,
  Home,
  Monitor as DesktopIcon,
  FileText,
  Download,
  Image as ImageIcon,
  Music,
  Video
} from 'lucide-react';
import type { DriveInfo, SystemPlace, TagColor } from '../types/finder';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  places: SystemPlace[];
  drives: DriveInfo[];
  selectedTag: TagColor | null;
  onSelectTag: (tag: TagColor | null) => void;
  width: number;
  onResize: (newWidth: number) => void;
  onOpenAbout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  onNavigate,
  places,
  drives,
  selectedTag,
  onSelectTag,
  width,
  onResize,
  onOpenAbout,
}) => {
  const [favoritesExpanded, setFavoritesExpanded] = useState(true);
  const [locationsExpanded, setLocationsExpanded] = useState(true);
  const [tagsExpanded, setTagsExpanded] = useState(true);

  const tagsList: { id: TagColor; name: string; color: string }[] = [
    { id: 'red', name: 'Red', color: '#ff453a' },
    { id: 'orange', name: 'Orange', color: '#ff9f0a' },
    { id: 'yellow', name: 'Yellow', color: '#ffd60a' },
    { id: 'green', name: 'Green', color: '#30d158' },
    { id: 'blue', name: 'Blue', color: '#0a84ff' },
    { id: 'purple', name: 'Purple', color: '#bf5af2' },
    { id: 'gray', name: 'Gray', color: '#98989d' },
  ];

  // Map icon strings to Lucide components
  const getPlaceIcon = (iconName: string) => {
    switch (iconName) {
      case 'desktop': return <DesktopIcon className="w-4 h-4 text-sky-500" />;
      case 'documents': return <FileText className="w-4 h-4 text-blue-500" />;
      case 'downloads': return <Download className="w-4 h-4 text-teal-500" />;
      case 'pictures': return <ImageIcon className="w-4 h-4 text-pink-500" />;
      case 'music': return <Music className="w-4 h-4 text-red-500" />;
      case 'videos': return <Video className="w-4 h-4 text-purple-500" />;
      case 'home':
      default: return <Home className="w-4 h-4 text-blue-600" />;
    }
  };

  // Resize handler
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = width;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX;
      const newWidth = Math.min(Math.max(startWidth + delta, 160), 320);
      onResize(newWidth);
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  return (
    <aside
      style={{ width }}
      className="relative shrink-0 h-full bg-[#eef0f3]/90 dark:bg-[#1e1e20]/90 backdrop-blur-xl border-r border-gray-200/70 dark:border-white/10 flex flex-col select-none z-10"
    >
      {/* Top Header with Brand Mark and App Title */}
      <div className="h-13 flex items-center justify-between px-3 titlebar-drag border-b border-black/5 dark:border-white/5">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 rounded-md bg-[#20242C] flex items-center justify-center shadow-xs">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" className="w-3.5 h-3.5">
              <path d="M14 17H25L32 28H43L51 39" fill="none" stroke="#E2E6EF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 17V40L31 49H51V39" fill="none" stroke="#9AADD0" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="14" cy="17" r="4" fill="#FFFFFF"/>
              <circle cx="51" cy="39" r="4" fill="#9AADD0"/>
            </svg>
          </div>
          <span className="font-semibold text-xs text-gray-800 dark:text-gray-100 tracking-wide">
            Rove
          </span>
        </div>
        {onOpenAbout && (
          <button
            onClick={onOpenAbout}
            title="About Rove"
            className="no-drag p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 font-mono">v0.1.0-alpha.1</span>
          </button>
        )}
      </div>

      {/* Scrollable Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-2.5 py-1 space-y-4 text-xs font-medium text-gray-600 dark:text-gray-300">

        {/* FAVORITES */}
        <div>
          <button
            onClick={() => setFavoritesExpanded(!favoritesExpanded)}
            className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-semibold tracking-wider text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 uppercase transition-colors"
          >
            <span>Favorites</span>
            {favoritesExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>

          {favoritesExpanded && (
            <div className="mt-0.5 space-y-0.5">
              {places.map((place) => {
                const isActive = currentPath.toLowerCase() === place.path.toLowerCase() && !selectedTag;
                return (
                  <button
                    key={place.id}
                    onClick={() => {
                      onSelectTag(null);
                      onNavigate(place.path);
                    }}
                    className={`w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md transition-all text-left ${
                      isActive
                        ? 'bg-[#007aff] text-white font-semibold shadow-sm'
                        : 'hover:bg-black/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    <span className={isActive ? 'text-white' : ''}>{getPlaceIcon(place.icon)}</span>
                    <span className="truncate">{place.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* LOCATIONS */}
        <div>
          <button
            onClick={() => setLocationsExpanded(!locationsExpanded)}
            className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-semibold tracking-wider text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 uppercase transition-colors"
          >
            <span>Locations</span>
            {locationsExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>

          {locationsExpanded && (
            <div className="mt-0.5 space-y-0.5">
              {drives.map((drive) => {
                const isActive = currentPath.toLowerCase() === drive.mount.toLowerCase() && !selectedTag;
                return (
                  <button
                    key={drive.mount}
                    onClick={() => {
                      onSelectTag(null);
                      onNavigate(drive.mount);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md transition-all text-left ${
                      isActive
                        ? 'bg-[#007aff] text-white font-semibold shadow-sm'
                        : 'hover:bg-black/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <HardDrive className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                      <span className="truncate">{drive.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* TAGS */}
        <div>
          <button
            onClick={() => setTagsExpanded(!tagsExpanded)}
            className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-semibold tracking-wider text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 uppercase transition-colors"
          >
            <span>Tags</span>
            {tagsExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>

          {tagsExpanded && (
            <div className="mt-0.5 space-y-0.5">
              {tagsList.map((tag) => {
                const isActive = selectedTag === tag.id;
                return (
                  <button
                    key={tag.id}
                    onClick={() => {
                      if (isActive) {
                        onSelectTag(null);
                      } else {
                        onSelectTag(tag.id);
                      }
                    }}
                    className={`w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-md transition-all text-left ${
                      isActive
                        ? 'bg-[#007aff] text-white font-semibold shadow-sm'
                        : 'hover:bg-black/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="truncate">{tag.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Resize Handle */}
      <div
        onMouseDown={handleMouseDown}
        className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-blue-500/30 transition-colors z-20"
      />
    </aside>
  );
};
