# Rove

> **Your files. Your flow.**

Rove is a polished, open-source file manager for Windows, inspired by the thoughtful navigation, clean interface, and fluid workflows of macOS. It combines a refined user experience with practical Windows filesystem integration.

An **AshcrestHQ** open-source project.
Intended repository: [`AshcrestHQ/Rove`](https://github.com/AshcrestHQ/Rove)

---

> [!WARNING]
> **Alpha Evaluation Notice:** Rove is currently in active public alpha (`v0.1.0-alpha.1`). This release is intended for testing, community evaluation, and feedback. Rove is **not yet a daily-driver replacement for Windows Explorer**. Users are strongly advised to maintain independent backups of critical data before performing destructive filesystem operations.

---

## Overview

Rove provides a fast, distraction-free environment for organizing and browsing your files on Windows 10 and Windows 11. It brings together macOS-inspired workflows—such as cascading Miller Columns, instant Spacebar Quick Look previews, frosted-glass styling, and 7-color tagging—with deep native Windows integration, including logical drive detection, safe deletion to the Windows Recycle Bin, and Ubuntu/GNOME-inspired window management.

Rove is an independent open-source project developed by AshcrestHQ and is not affiliated with, sponsored by, or endorsed by Apple Inc., Canonical Ltd., or Microsoft Corporation.

---

## Key Features

### 4 Distinct View Modes
- **Miller Columns View:** Horizontal cascading directory panes that scroll smoothly as you navigate deeper into subfolders, featuring an integrated file inspector preview pane for selected items. Drill-down state is preserved across visibility toggles.
- **Icons View:** Scalable grid view with an adjustable zoom slider, inline renaming (`F2` or click-to-rename), and clean file spacing.
- **List View:** Fast, sortable table displaying detailed file metadata including *Name*, *Date Modified*, *Size*, and *Kind*.
- **Gallery View:** Focused media browsing layout featuring a prominent central preview stage alongside a thumbnail filmstrip of folder contents.

### Instant Quick Look (`Spacebar`)
- Tap `Spacebar` on any highlighted file to summon an instant floating frosted-glass preview window without launching heavy external programs.
- Supports high-resolution images, plain text, Markdown, JSON, source code (with syntax hints), audio playback, and video.
- Navigate effortlessly through folder items using the left and right arrow keys (`←` / `→`) while the preview remains open.

### Ubuntu/GNOME-Inspired Window Chrome
- Clean, modern window controls positioned on the upper-right of the window title bar (Minimize, Maximize/Restore, Close).
- Features circular action buttons with Ubuntu's signature orange hover treatment (`#e95420`) for the close button.

### Robust Windows Hidden & System File Visibility
- Files and directories marked with Windows `Hidden` or `System` attributes are automatically identified using batch `attrib.exe` checks and safe `lstat` inspection.
- Cluttering Windows profile artifacts (such as `AppData`, `Application Data`, `Cookies`, `Local Settings`, and `NTUSER.DAT*`) and restricted system junction points are safely hidden by default.
- A dedicated toolbar toggle button (`Eye` / `EyeOff`) with accessible tooltips allows instant toggling of hidden items.
- Your visibility preference is automatically persisted to `%USERPROFILE%\.rove\settings.json` across app restarts.

### Dialog-Based File & Folder Creation
- Dedicated creation modals (`FolderPlus` and `FilePlus` toolbar buttons or `Ctrl + Shift + N`) for creating new folders and files.
- Enforces strict Windows filename validation in real time: rejects illegal characters (`\ / : * ? " < > |`), non-printable ASCII control characters, trailing spaces/periods, and reserved DOS device names (`CON`, `PRN`, `AUX`, `NUL`, `COM1-9`, `LPT1-9`).
- Safe atomic file creation (`wx` write flag) with proactive duplicate-name collision detection.

### Multi-Layered Vector Icon System
- Hand-crafted multi-layered folder geometry with dynamic color gradients, tab accents, and subtle light reflections.
- Dedicated folder emblems for core system locations: Desktop, Downloads, Documents, Pictures, Music, Videos, Home, Code/Dev, and Settings.
- Color-coded document cards with category stripes and file extension badges for images, audio, video, documents, code, archives, and system files.

### 7-Color Tagging System
- Categorize and label files using Red, Orange, Yellow, Green, Blue, Purple, or Gray color tags.
- Filter the active directory or sidebar items by tag color with a single click.
- Stored reliably in `%USERPROFILE%\.rove\tags.json` with seamless backward-compatible migration from legacy configurations.

### Native Windows Integration
- **Logical Drive Detection:** Automatically enumerates all attached Windows logical drives (`C:\`, `D:\`, etc.) with real-time storage gauges.
- **Recycle Bin Deletion:** Moves deleted items directly to the Windows Recycle Bin using PowerShell and `Microsoft.VisualBasic.FileIO.FileSystem`, protecting against accidental file loss.
- **System Launch & Reveal:** Open files in their registered Windows default applications (`shell.openPath`) or reveal items directly in Windows Explorer (`shell.showItemInFolder`).
- **Multi-Tab Browsing:** Open multiple folder tabs (`Ctrl + T` to open, `Ctrl + W` to close) with independent navigation histories and search filters.
- **Breadcrumb Navigation:** Interactive path bar allowing one-click navigation to any ancestor directory.

---

## Supported Platforms

| Platform | Architecture | Status |
| :--- | :--- | :--- |
| **Windows 11** | x64 (64-bit) | Supported (Tested) |
| **Windows 10** (v1809+) | x64 (64-bit) | Supported |

---

## Installation

### Windows NSIS Installer (Alpha 1)

Download the official pre-release installer:

**`Rove-Setup-0.1.0-alpha.1-x64.exe`**

#### Installer Features
- **Customizable Installation Directory:** Choose your preferred target folder on any drive.
- **Shortcut Configuration:** Creates Start Menu shortcuts and an optional Desktop shortcut.
- **Clean Uninstallation:** Standard Windows Add/Remove Programs entry; uninstallation safely preserves user preferences and tags in `%USERPROFILE%\.rove\`.

> [!NOTE]
> **Windows Defender SmartScreen Notice:**
> Open-source alpha builds are currently unsigned while an AshcrestHQ commercial code-signing certificate is being established. When launching an unsigned installer for the first time, Windows Defender SmartScreen may display an *"Unknown Publisher"* warning.
> To proceed: click **"More info"**, then select **"Run anyway"**.

---

## Keyboard Shortcuts

| Shortcut | Context | Action |
| :--- | :--- | :--- |
| `Space` | File list | Toggle **Quick Look** floating preview |
| `Enter` | File list | Open selected folder or launch file in default app |
| `Backspace` | Main window | Navigate to parent directory / back in history |
| `Ctrl + T` | Main window | Open a new folder tab |
| `Ctrl + W` | Main window | Close active folder tab |
| `Ctrl + Shift + N` | Main window | Create new folder (opens naming dialog) |
| `Ctrl + I` | Selected item | Open **Get Info** file inspector modal |
| `F2` | Selected item | Inline rename selected item |
| `Delete` | Selected item | Move selected item to Windows Recycle Bin |
| `←` / `→` | Quick Look | Cycle previous / next item in the folder |
| `Escape` | Modals | Close Quick Look, Get Info, or Name Entry dialog |

---

## Development

### Prerequisites
- **Node.js:** 20.x or higher (Node 22 LTS recommended)
- **npm:** 10.x or higher
- **OS:** Windows 10/11 x64
- **PowerShell:** 5.1 or PowerShell 7+ (pre-installed on Windows)

### Setup

```bash
# Clone the repository (once published to GitHub)
git clone https://github.com/AshcrestHQ/Rove.git
cd Rove

# Install dependencies
npm install

# (Optional) Regenerate branding icon assets
npm run icons
```

### Running Locally

```bash
# Launch Electron desktop application with Vite hot reloading
npm run electron:dev

# Run in browser preview mode (utilizing simulated virtual filesystem)
npm run dev

# Compile frontend and launch standalone Electron application
npm start
```

### Packaging the Windows Installer

To compile production assets and generate the NSIS Windows installer:

```bash
npm run dist:win
```

The resulting installer `Rove-Setup-0.1.0-alpha.1-x64.exe` will be generated in the `dist-electron/` directory.

---

## Architecture

```
Rove/
├── electron/
│   ├── main.cjs            # Electron main process (lifecycle, IPC handlers, attrib detection, drives)
│   └── preload.cjs         # Context bridge exposing secure, typed window.roveAPI
├── src/
│   ├── components/         # Modular React components
│   │   ├── views/          # 4 view modes (ColumnsView, IconsView, ListView, GalleryView)
│   │   ├── FileIcon.tsx    # Multi-layered vector icons & category badges
│   │   ├── WindowControls.tsx # Ubuntu/GNOME-inspired window controls
│   │   ├── NameEntryModal.tsx # Validated dialog for file/folder creation
│   │   ├── QuickLookModal.tsx # Instant Spacebar file preview modal
│   │   ├── Toolbar.tsx     # Navigation, view modes, search, theme & hidden file toggles
│   │   └── Sidebar.tsx     # System places, logical drives, color tags
│   ├── services/
│   │   └── fileService.ts  # Typed filesystem service with Electron IPC & web fallback
│   ├── types/
│   │   └── finder.ts       # Shared TypeScript types and interfaces
│   ├── App.tsx             # Main application orchestrator and keyboard shortcut manager
│   └── index.css           # Tailwind CSS v4 design system with custom dark mode variants
├── assets/branding/        # Official Rove brand marks (SVG, PNG, ICO)
└── %USERPROFILE%\.rove\    # Persisted settings (settings.json) and file tags (tags.json)
```

---

## Current Limitations & Roadmap

- **Archive Extraction:** ZIP archives are currently inspected as archive files; built-in native archive extraction is scheduled for v0.2.0.
- **External Drag-and-Drop:** Native file drag-and-drop from Rove into external third-party Windows applications is under active refinement.
- **Code Signing:** Official binaries will be signed with an AshcrestHQ digital certificate once organization verification completes.

---

## Contributing

Contributions from the community are warmly welcomed! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on development workflows, code style, and pull request procedures.

---

## Security

To report security vulnerabilities responsibly, please review our [SECURITY.md](SECURITY.md) for confidential reporting instructions via GitHub Security Advisories.

---

## License

Rove is licensed under the [MIT License](LICENSE).
Copyright © 2026 AshcrestHQ.
