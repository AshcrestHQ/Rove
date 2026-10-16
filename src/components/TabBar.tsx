import React from 'react';
import { Plus, X, Folder } from 'lucide-react';
import type { TabState } from '../types/finder';

interface TabBarProps {
  tabs: TabState[];
  activeTabId: string;
  onSelectTab: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
  onNewTab: () => void;
}

export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewTab,
}) => {
  if (tabs.length <= 1) {
    return null; // Like macOS Finder, hide tab bar if only 1 tab is open, or keep subtle
  }

  return (
    <div className="h-8 bg-[#e9eaed] dark:bg-[#1f1f21] border-b border-gray-200 dark:border-white/10 flex items-center px-2 select-none overflow-x-auto no-scrollbar z-15">
      <div className="flex items-center space-x-1 flex-1">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`group h-6.5 max-w-[200px] min-w-[120px] flex items-center justify-between px-2.5 rounded-t-md text-xs cursor-pointer border-t border-l border-r transition-all ${
                isActive
                  ? 'bg-white dark:bg-[#2c2c2e] text-gray-900 dark:text-white font-medium shadow-sm border-gray-300 dark:border-white/10'
                  : 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 border-transparent'
              }`}
            >
              <div className="flex items-center space-x-1.5 truncate mr-1">
                <Folder className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-blue-500' : 'text-gray-400'}`} />
                <span className="truncate">{tab.title}</span>
              </div>

              {tabs.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(tab.id);
                  }}
                  className="p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={onNewTab}
        title="New Tab (Ctrl+T)"
        className="p-1 rounded text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors ml-2"
      >
        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
      </button>
    </div>
  );
};
