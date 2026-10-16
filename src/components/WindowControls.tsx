import React, { useState, useEffect } from 'react';
import { Minus, Square, Copy, X } from 'lucide-react';
import { FileService } from '../services/fileService';

export const WindowControls: React.FC = () => {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function checkMaximized() {
      try {
        const max = await FileService.windowIsMaximized();
        if (isMounted) setIsMaximized(max);
      } catch {}
    }
    checkMaximized();

    const handleResize = () => {
      checkMaximized();
    };
    window.addEventListener('resize', handleResize);
    return () => {
      isMounted = false;
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleMinimize = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await FileService.windowMinimize();
  };

  const handleMaximize = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await FileService.windowMaximize();
    const max = await FileService.windowIsMaximized();
    setIsMaximized(max);
  };

  const handleClose = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await FileService.windowClose();
  };

  return (
    <div
      className="flex items-center space-x-1.5 px-2 py-1 no-drag select-none"
      onDoubleClick={(e) => e.stopPropagation()}
    >
      {/* Minimize */}
      <button
        onClick={handleMinimize}
        title="Minimize"
        aria-label="Minimize Window"
        className="w-6 h-6 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/15 focus:outline-none focus:ring-1 focus:ring-black/20 dark:focus:ring-white/20 active:scale-90 transition-all cursor-pointer"
      >
        <Minus className="w-3 h-3 stroke-[2.5]" />
      </button>

      {/* Maximize / Restore */}
      <button
        onClick={handleMaximize}
        title={isMaximized ? 'Restore' : 'Maximize'}
        aria-label={isMaximized ? 'Restore Window' : 'Maximize Window'}
        className="w-6 h-6 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/15 focus:outline-none focus:ring-1 focus:ring-black/20 dark:focus:ring-white/20 active:scale-90 transition-all cursor-pointer"
      >
        {isMaximized ? (
          <Copy className="w-2.5 h-2.5 stroke-[2.2] rotate-180" />
        ) : (
          <Square className="w-2.5 h-2.5 stroke-[2.5]" />
        )}
      </button>

      {/* Close (Ubuntu Signature Orange Hover #e95420) */}
      <button
        onClick={handleClose}
        title="Close"
        aria-label="Close Window"
        className="w-6 h-6 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-[#e95420] hover:text-white dark:hover:bg-[#e95420] dark:hover:text-white focus:outline-none focus:ring-1 focus:ring-[#e95420]/50 active:scale-90 transition-all cursor-pointer"
      >
        <X className="w-3 h-3 stroke-[2.5]" />
      </button>
    </div>
  );
};
