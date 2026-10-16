import React, { useState, useEffect, useRef } from 'react';
import { FolderPlus, FilePlus, AlertCircle, X } from 'lucide-react';

interface NameEntryModalProps {
  isOpen: boolean;
  mode: 'folder' | 'file';
  currentPath: string;
  existingNames: string[];
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
}

const INVALID_CHARS = /[<>:"/\\|?*]/;
const RESERVED_NAMES = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\..*)?$/i;

export const NameEntryModal: React.FC<NameEntryModalProps> = ({
  isOpen,
  mode,
  currentPath,
  existingNames,
  onClose,
  onSubmit,
}) => {
  const defaultName = mode === 'folder' ? 'Untitled Folder' : 'Untitled.txt';
  const [name, setName] = useState(defaultName);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize name and select text on open
  useEffect(() => {
    if (isOpen) {
      const initial = mode === 'folder' ? 'Untitled Folder' : 'Untitled.txt';
      setName(initial);
      setError(null);
      setIsSubmitting(false);

      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          const dotIndex = initial.lastIndexOf('.');
          if (mode === 'file' && dotIndex > 0) {
            inputRef.current.setSelectionRange(0, dotIndex);
          } else {
            inputRef.current.select();
          }
        }
      }, 50);
    }
  }, [isOpen, mode]);

  if (!isOpen) return null;

  const validate = (value: string): string | null => {
    const trimmed = value.trim();
    if (!trimmed) {
      return 'Please enter a name.';
    }
    if (trimmed === '.' || trimmed === '..') {
      return 'The specified name is not allowed.';
    }
    const hasControlChar = [...trimmed].some((c) => c.charCodeAt(0) < 32);
    if (INVALID_CHARS.test(trimmed) || hasControlChar) {
      return 'A name cannot contain any of the following characters: \\ / : * ? " < > |';
    }
    if (RESERVED_NAMES.test(trimmed)) {
      return 'The specified name is a reserved Windows device name.';
    }
    if (trimmed.endsWith('.') || trimmed.endsWith(' ')) {
      return 'A name cannot end with a period or a space.';
    }
    const lower = trimmed.toLowerCase();
    if (existingNames.some((n) => n.toLowerCase() === lower)) {
      return `An item named "${trimmed}" already exists in this folder.`;
    }
    return null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    setError(validate(val));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate(name);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(name.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs animate-fade-in"
      onKeyDown={handleKeyDown}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-[#252528] rounded-xl shadow-2xl border border-gray-200 dark:border-white/10 p-5 animate-pop"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              {mode === 'folder' ? <FolderPlus className="w-4 h-4 stroke-[2.2]" /> : <FilePlus className="w-4 h-4 stroke-[2.2]" />}
            </div>
            <div>
              <h2 id="modal-title" className="text-sm font-semibold text-gray-900 dark:text-white">
                {mode === 'folder' ? 'New Folder' : 'New File'}
              </h2>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate max-w-xs">
                In: {currentPath.split('\\').filter(Boolean).pop() || currentPath}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              {mode === 'folder' ? 'Folder Name' : 'File Name'}
            </label>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={handleChange}
              disabled={isSubmitting}
              className={`w-full px-3 py-1.5 text-xs rounded-lg border bg-gray-50 dark:bg-[#1a1a1c] text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all ${
                error
                  ? 'border-red-500 focus:ring-red-500/30'
                  : 'border-gray-300 dark:border-white/10 focus:ring-blue-500 focus:border-blue-500'
              }`}
            />
            {error && (
              <div className="flex items-center space-x-1.5 mt-2 text-red-500 dark:text-red-400 text-[11px] animate-pop">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-100 dark:border-white/5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={Boolean(error) || !name.trim() || isSubmitting}
              className="px-4 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all flex items-center space-x-1"
            >
              {isSubmitting ? (
                <span>Creating...</span>
              ) : (
                <span>Create</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
