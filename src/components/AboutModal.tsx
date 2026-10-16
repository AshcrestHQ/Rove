import React from 'react';
import { X, ExternalLink } from 'lucide-react';

interface AboutModalProps {
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/45 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-pop select-none font-sans"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-white dark:bg-[#252528] rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 p-6 flex flex-col items-center text-center relative overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Official Rove Geometric Mark */}
        <div className="w-16 h-16 rounded-2xl shadow-lg flex items-center justify-center mb-3.5 bg-[#20242C] ring-1 ring-white/10">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" className="w-13 h-13">
            <path
              d="M14 17H25L32 28H43L51 39"
              fill="none"
              stroke="#E2E6EF"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M14 17V40L31 49H51V39"
              fill="none"
              stroke="#9AADD0"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="14" cy="17" r="3.5" fill="#FFFFFF" />
            <circle cx="51" cy="39" r="3.5" fill="#9AADD0" />
          </svg>
        </div>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Rove</h2>
        <span className="text-xs font-semibold px-2 py-0.5 mt-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-mono">
          v0.1.0-alpha.1 (Windows x64)
        </span>

        <p className="text-xs font-medium text-gray-800 dark:text-gray-200 mt-2.5">
          Your files. Your flow.
        </p>

        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-2 leading-relaxed px-2">
          A polished, open-source file manager for Windows, inspired by the thoughtful navigation, clean interface, and fluid workflows of macOS.
        </p>

        <div className="w-full border-t border-gray-100 dark:border-white/10 mt-4 pt-3 flex flex-col items-center space-y-1.5 text-[11px] text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <span>An</span>
            <span className="font-semibold text-gray-700 dark:text-gray-200">AshcrestHQ</span>
            <span>open-source project</span>
          </div>

          <a
            href="https://github.com/AshcrestHQ/Rove"
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1 text-blue-500 hover:text-blue-600 dark:text-blue-400 hover:underline pt-1"
          >
            <span>github.com/AshcrestHQ/Rove</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <span className="text-[10px] text-gray-400 pt-1">
            Released under the MIT License • 2026
          </span>
        </div>
      </div>
    </div>
  );
};
