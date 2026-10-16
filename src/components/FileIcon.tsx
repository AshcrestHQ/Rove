import React from 'react';
import type { TagColor } from '../types/finder';
import {
  Code2,
  FileText,
  FileSpreadsheet,
  FileArchive,
  Image as ImageIcon,
  Music,
  Video,
  Terminal,
  Home,
  Download,
  Monitor as DesktopIcon,
  Folder as FolderIcon,
  File as GenericFileIcon,
  Settings
} from 'lucide-react';

interface FileIconProps {
  name: string;
  isDirectory: boolean;
  extension?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  tag?: TagColor | null;
  className?: string;
}

export const FileIcon: React.FC<FileIconProps> = ({
  name,
  isDirectory,
  extension = '',
  size = 'md',
  tag,
  className = '',
}) => {
  const ext = extension.toLowerCase();
  const lowerName = name.toLowerCase();

  // Pixel and container dimensions
  const dimensions = {
    sm: { container: 'w-4 h-4', glyph: 'w-2.5 h-2.5', text: 'text-[7px]' },
    md: { container: 'w-7 h-7', glyph: 'w-3.5 h-3.5', text: 'text-[8px]' },
    lg: { container: 'w-14 h-14', glyph: 'w-6 h-6', text: 'text-[10px]' },
    xl: { container: 'w-20 h-20', glyph: 'w-9 h-9', text: 'text-xs' },
  }[size];

  const tagColorBg: Record<TagColor, string> = {
    red: '#ff453a',
    orange: '#ff9f0a',
    yellow: '#ffd60a',
    green: '#30d158',
    blue: '#0a84ff',
    purple: '#bf5af2',
    gray: '#98989d',
  };

  // Render Folder
  if (isDirectory) {
    let specialIcon: React.ReactNode = null;
    let folderGradient = 'from-[#3b82f6] to-[#1d4ed8]'; // Default Rove Deep Blue Folder
    let tabColor = '#60a5fa';

    if (lowerName === 'desktop' || lowerName.includes('desktop')) {
      specialIcon = <DesktopIcon className={`${dimensions.glyph} text-white/90`} />;
      folderGradient = 'from-[#0ea5e9] to-[#0369a1]';
      tabColor = '#38bdf8';
    } else if (lowerName === 'downloads' || lowerName.includes('download')) {
      specialIcon = <Download className={`${dimensions.glyph} text-white/90`} />;
      folderGradient = 'from-[#0d9488] to-[#0f766e]';
      tabColor = '#2dd4bf';
    } else if (lowerName === 'documents' || lowerName.includes('document')) {
      specialIcon = <FileText className={`${dimensions.glyph} text-white/90`} />;
      folderGradient = 'from-[#2563eb] to-[#1e40af]';
      tabColor = '#60a5fa';
    } else if (lowerName === 'pictures' || lowerName.includes('picture') || lowerName.includes('photo')) {
      specialIcon = <ImageIcon className={`${dimensions.glyph} text-white/90`} />;
      folderGradient = 'from-[#db2777] to-[#9d174d]';
      tabColor = '#f472b6';
    } else if (lowerName === 'music') {
      specialIcon = <Music className={`${dimensions.glyph} text-white/90`} />;
      folderGradient = 'from-[#e11d48] to-[#9f1239]';
      tabColor = '#fb7185';
    } else if (lowerName === 'videos' || lowerName.includes('video') || lowerName.includes('movie')) {
      specialIcon = <Video className={`${dimensions.glyph} text-white/90`} />;
      folderGradient = 'from-[#7c3aed] to-[#5b21b6]';
      tabColor = '#a78bfa';
    } else if (lowerName === 'home' || lowerName === 'user' || lowerName === 'users') {
      specialIcon = <Home className={`${dimensions.glyph} text-white/90`} />;
      folderGradient = 'from-[#2563eb] to-[#1d4ed8]';
      tabColor = '#60a5fa';
    } else if (lowerName === 'code' || lowerName.includes('project') || lowerName.includes('dev')) {
      specialIcon = <Code2 className={`${dimensions.glyph} text-white/90`} />;
      folderGradient = 'from-[#4f46e5] to-[#3730a3]';
      tabColor = '#818cf8';
    } else if (lowerName.includes('appdata') || lowerName.includes('config') || lowerName.includes('setting')) {
      specialIcon = <Settings className={`${dimensions.glyph} text-white/90`} />;
      folderGradient = 'from-[#64748b] to-[#475569]';
      tabColor = '#94a3b8';
    }

    // Small mode (16x16) uses vector Folder icon for optimal sharpness
    if (size === 'sm') {
      return (
        <div className={`relative flex items-center justify-center shrink-0 ${dimensions.container} ${className}`}>
          <FolderIcon className="w-4 h-4 text-blue-500 fill-blue-500/30" />
          {tag && (
            <span
              className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ring-1 ring-white dark:ring-[#1e1e1e]"
              style={{ backgroundColor: tagColorBg[tag] }}
            />
          )}
        </div>
      );
    }

    return (
      <div className={`relative flex items-center justify-center shrink-0 ${dimensions.container} ${className} select-none`}>
        {/* Modern Vector Folder Structure */}
        <div className="relative w-full h-[85%] flex flex-col justify-end">
          {/* Back Tab */}
          <div
            className="absolute top-0 left-[6%] w-[38%] h-[24%] rounded-t-[3px] shadow-xs"
            style={{ backgroundColor: tabColor }}
          />

          {/* Back Sheet Preview Line */}
          <div className="absolute top-[12%] left-[8%] right-[8%] h-[20%] bg-white/70 dark:bg-white/20 rounded-t-[2px]" />

          {/* Front Flap / Body */}
          <div className={`relative w-full h-[80%] rounded-[5px] bg-gradient-to-b ${folderGradient} shadow-md border-t border-white/40 flex items-center justify-center overflow-hidden`}>
            {/* Subtle light sweep reflection */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />

            {/* Folder Emblem Glyph */}
            {specialIcon ? (
              <div className="drop-shadow-sm flex items-center justify-center">{specialIcon}</div>
            ) : (
              <FolderIcon className={`${dimensions.glyph} text-white/35 drop-shadow-xs`} />
            )}
          </div>
        </div>

        {/* Tag Dot */}
        {tag && (
          <span
            className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-[#1e1e1e] shadow-sm z-10"
            style={{ backgroundColor: tagColorBg[tag] }}
          />
        )}
      </div>
    );
  }

  // File Icon Logic
  let iconGlyph = <GenericFileIcon className={`${dimensions.glyph} text-gray-500 dark:text-gray-400`} />;
  let accentBorder = 'border-gray-200 dark:border-white/10';
  let badgeBg = 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  let accentStripe = 'bg-gray-400';

  // Images
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp', 'ico', 'tiff'].includes(ext)) {
    iconGlyph = <ImageIcon className={`${dimensions.glyph} text-pink-500`} />;
    accentBorder = 'border-pink-200/80 dark:border-pink-900/40';
    badgeBg = 'bg-pink-50 text-pink-700 dark:bg-pink-950/80 dark:text-pink-300';
    accentStripe = 'bg-pink-500';
  }
  // Audio
  else if (['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac', 'wma'].includes(ext)) {
    iconGlyph = <Music className={`${dimensions.glyph} text-rose-500`} />;
    accentBorder = 'border-rose-200/80 dark:border-rose-900/40';
    badgeBg = 'bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300';
    accentStripe = 'bg-rose-500';
  }
  // Video
  else if (['mp4', 'mkv', 'mov', 'webm', 'avi', 'wmv', 'flv'].includes(ext)) {
    iconGlyph = <Video className={`${dimensions.glyph} text-purple-500`} />;
    accentBorder = 'border-purple-200/80 dark:border-purple-900/40';
    badgeBg = 'bg-purple-50 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300';
    accentStripe = 'bg-purple-500';
  }
  // Code & Web
  else if (['js', 'ts', 'jsx', 'tsx', 'py', 'html', 'css', 'scss', 'json', 'c', 'cpp', 'rs', 'go', 'java', 'sql', 'yaml', 'yml', 'xml', 'php', 'rb'].includes(ext)) {
    iconGlyph = <Code2 className={`${dimensions.glyph} text-blue-500`} />;
    accentBorder = 'border-blue-200/80 dark:border-blue-900/40';
    badgeBg = 'bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300';
    accentStripe = 'bg-blue-500';
  }
  // Archives
  else if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'].includes(ext)) {
    iconGlyph = <FileArchive className={`${dimensions.glyph} text-amber-500`} />;
    accentBorder = 'border-amber-200/80 dark:border-amber-900/40';
    badgeBg = 'bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300';
    accentStripe = 'bg-amber-500';
  }
  // Executables & Scripts
  else if (['exe', 'msi', 'bat', 'ps1', 'sh', 'cmd', 'vbs'].includes(ext)) {
    iconGlyph = <Terminal className={`${dimensions.glyph} text-emerald-500`} />;
    accentBorder = 'border-emerald-200/80 dark:border-emerald-900/40';
    badgeBg = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300';
    accentStripe = 'bg-emerald-500';
  }
  // Spreadsheets
  else if (['xlsx', 'xls', 'csv', 'ods'].includes(ext)) {
    iconGlyph = <FileSpreadsheet className={`${dimensions.glyph} text-emerald-600`} />;
    accentBorder = 'border-emerald-200/80 dark:border-emerald-900/40';
    badgeBg = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300';
    accentStripe = 'bg-emerald-600';
  }
  // Documents / PDF
  else if (['pdf', 'docx', 'doc', 'rtf', 'odt'].includes(ext)) {
    iconGlyph = <FileText className={`${dimensions.glyph} text-red-500`} />;
    accentBorder = 'border-red-200/80 dark:border-red-900/40';
    badgeBg = 'bg-red-50 text-red-700 dark:bg-red-950/80 dark:text-red-300';
    accentStripe = 'bg-red-500';
  }
  // Plain text / Markdown
  else if (['txt', 'md', 'log', 'ini', 'env', 'cfg'].includes(ext)) {
    iconGlyph = <FileText className={`${dimensions.glyph} text-slate-500 dark:text-slate-400`} />;
    accentBorder = 'border-slate-200 dark:border-white/10';
    badgeBg = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    accentStripe = 'bg-slate-400';
  }

  // Small size (16x16) for clean table lists
  if (size === 'sm') {
    return (
      <div className={`relative flex items-center justify-center shrink-0 ${dimensions.container} ${className}`}>
        <FileText className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
        {tag && (
          <span
            className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ring-1 ring-white dark:ring-[#1e1e1e]"
            style={{ backgroundColor: tagColorBg[tag] }}
          />
        )}
      </div>
    );
  }

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${dimensions.container} ${className} select-none`}>
      {/* Document Sheet Card */}
      <div className={`relative w-[85%] h-[92%] rounded-[4px] bg-white dark:bg-[#28282b] border ${accentBorder} shadow-xs flex flex-col items-center justify-center overflow-hidden transition-transform group-hover:scale-102`}>
        {/* Top Folded Dog-Ear Corner */}
        <div className="absolute top-0 right-0 w-[22%] h-[22%] bg-gray-100 dark:bg-[#343438] border-b border-l border-gray-300 dark:border-white/15 rounded-bl-[2px]" />

        {/* Top Accent Stripe */}
        <div className={`absolute top-0 left-0 right-[22%] h-[2px] ${accentStripe}`} />

        {/* Main Glyph */}
        <div className="flex items-center justify-center">{iconGlyph}</div>

        {/* Extension Badge for Large / XL */}
        {(size === 'lg' || size === 'xl') && ext && (
          <span className={`absolute bottom-1 px-1.5 py-0.5 ${dimensions.text} font-bold rounded uppercase tracking-wider ${badgeBg} shadow-2xs`}>
            {ext}
          </span>
        )}
      </div>

      {/* Tag Dot */}
      {tag && (
        <span
          className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-[#1e1e1e] shadow-sm z-10"
          style={{ backgroundColor: tagColorBg[tag] }}
        />
      )}
    </div>
  );
};
