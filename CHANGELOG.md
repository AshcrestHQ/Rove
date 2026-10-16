# Changelog

All notable changes to **Rove** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0-alpha.1] - 2026-10-16

### Initial Public Alpha Release — "Your files. Your flow."

Initial public alpha pre-release of **Rove** by **AshcrestHQ**, bringing a thoughtful, macOS-inspired file management workflow and an Ubuntu/GNOME-inspired window experience to Windows 10 and 11 (x64).

> [!WARNING]
> **Alpha Notice:** This is an early public alpha preview intended for testing, community feedback, and architectural evaluation. Rove is **not yet a daily-driver replacement for Windows Explorer**. Users are strongly advised to keep independent backups of critical data before performing destructive filesystem operations. Official installer binaries are currently unsigned.

#### Added
- **4 Distinct View Modes:**
  - **Miller Columns View:** Cascading horizontal panes with continuous directory drill-down and interactive Inspector preview pane; drill-down selections are preserved across visibility state toggles.
  - **Icons View:** Scalable grid with zoom control slider, clean spacing, and inline renaming (`F2` or click-to-rename).
  - **List View:** Sortable multi-column table displaying *Name*, *Date Modified*, *Size*, and *Kind*.
  - **Gallery View:** Large center preview stage with an interactive horizontal thumbnail filmstrip reel.
- **Instant Quick Look (`Spacebar`):**
  - Instant floating frosted-glass preview window supporting images, markdown, plain text, JSON, source code, audio playback, and video without launching external applications.
  - Arrow key navigation (`←` / `→`) to cycle through items within the directory while the preview is open.
- **Ubuntu/GNOME-Inspired Window Chrome:**
  - Distinctive circular window management controls (Minimize, Maximize/Restore, Close) positioned on the upper-right of the title bar.
  - Ubuntu's signature orange hover state (`#e95420`) on the close action.
- **Windows Hidden & System File Visibility:**
  - Integrated Windows file attribute discovery using batch `attrib.exe` queries and safe non-recursive `lstat` inspection.
  - Automatically hides Windows profile artifacts (including `AppData`, `Application Data`, `Cookies`, `Local Settings`, and `NTUSER.DAT*`) and restricted system junction points by default.
  - Dedicated toolbar eye toggle (`Eye` / `EyeOff`) with accessible tooltips and clear visual state distinctions.
  - Persistent preference stored in `%USERPROFILE%\.rove\settings.json` that survives application restarts.
- **Dialog-Based File and Folder Creation:**
  - Dedicated creation modals triggered via toolbar buttons or `Ctrl + Shift + N`.
  - Real-time Windows filename validation rejecting illegal characters (`\ / : * ? " < > |`), ASCII control characters, trailing spaces/periods, and reserved DOS names (`CON`, `PRN`, `AUX`, `NUL`, `COM1-9`, `LPT1-9`).
  - Atomic file creation using Node's `wx` flag with proactive duplicate-name collision warnings.
- **Multi-Layered Vector Icon System:**
  - Multi-layered vector folder structures with dynamic gradients, tab accents, and subtle light reflections.
  - Dedicated system emblems for standard locations (Desktop, Downloads, Documents, Pictures, Music, Videos, Home, Code/Dev, and Settings).
  - Categorized document cards with category color stripes and file extension badges for images, audio, video, documents, code, archives, and system files.
- **Class-Based Dark Mode:**
  - Smooth light and dark themes using Tailwind CSS v4 custom variants.
  - Instant theme toggle in the toolbar with persistent synchronization in `%USERPROFILE%\.rove\settings.json`.
- **7-Color Tagging System:**
  - Color-label files with Red, Orange, Yellow, Green, Blue, Purple, or Gray tags.
  - Filter active directories or sidebar listings by tag color.
  - Saved in `%USERPROFILE%\.rove\tags.json` with automatic migration from legacy `.aura-finder` configuration.
- **Native Windows Integration:**
  - Automatic detection of all Windows logical drives (`C:\`, `D:\`, etc.) with real-time storage gauges.
  - Safe deletion to the Windows Recycle Bin using PowerShell and `Microsoft.VisualBasic.FileIO.FileSystem`.
  - Launch files directly in default Windows applications (`shell.openPath`).
  - Reveal files in Windows Explorer (`shell.showItemInFolder`).
  - Multi-tab browsing (`Ctrl + T`, `Ctrl + W`) with independent directory histories.
  - Interactive breadcrumb navigation path bar.
- **Packaging & Distribution:**
  - NSIS Windows installer (`Rove-Setup-0.1.0-alpha.1-x64.exe`) with custom installation directory selection.
  - Automatic Start Menu and Desktop shortcut creation.
  - Uninstaller that cleanly removes binaries while safely preserving user configuration in `%USERPROFILE%\.rove\`.
  - Multi-resolution Rove brand icon assets (`.ico`, `.png`, `.svg`).

#### Known Limitations
- In-app ZIP/archive extraction is planned for `v0.2.0`.
- Native file drag-and-drop to external third-party Windows applications is under active development.
- Windows Defender SmartScreen warning appears on launch because open-source alpha binaries are currently unsigned pending commercial code-signing setup.
