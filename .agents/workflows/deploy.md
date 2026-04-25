---
description: How to build and deploy DentiPOS to a client machine
---

# DentiPOS Deployment Guide

## Prerequisites (Developer Machine Only)
- Node.js 20 LTS or newer
- Git (optional, for version control)

## Step 1: Build the Application

```bash
# 1. Install dependencies (only needed first time or after changes)
npm install

# 2. Build the app and produce the .exe installer
npm run dist
```

This creates the following files in the `release/` folder:
- **`DentiPOS Setup 1.0.0.exe`** — Full Windows installer (recommended for clients)
- **`DentiPOS-Portable-1.0.0.exe`** — Portable version (no install needed)

## Step 2: Deliver to Client

### Option A: Installer (Recommended)
1. Copy `release/DentiPOS Setup 1.0.0.exe` to a USB drive or share via Google Drive/OneDrive
2. Send it to the client

### Option B: Portable Version
1. Copy `release/DentiPOS-Portable-1.0.0.exe` to a USB drive
2. The client can run it directly from the USB or copy it to their Desktop

## Step 3: Client Installation

### For the Installer (.exe):
1. Double-click **`DentiPOS Setup 1.0.0.exe`**
2. Windows SmartScreen may show a warning (app is not code-signed). Click **"More info"** → **"Run anyway"**
3. Choose the installation directory (default: `C:\Program Files\DentiPOS`)
4. Click **Install**
5. The app will appear in the Start Menu and optionally on the Desktop
6. Double-click the **DentiPOS** shortcut to launch

### For the Portable Version:
1. Double-click **`DentiPOS-Portable-1.0.0.exe`**
2. Windows SmartScreen may show a warning. Click **"More info"** → **"Run anyway"**
3. The app launches immediately — no installation required

## Important Notes

### Data Storage
- The SQLite database is stored in: `%APPDATA%/dentipos/dentipos_v2.sqlite`
- This means client data persists across app updates
- To backup: copy the file at that path

### Updating the App
1. Build a new version (increment version in `package.json`)
2. Run `npm run dist` again
3. Send the new installer to the client
4. The client runs the new installer — it will update in place
5. All data is preserved (database is in AppData, not in the app folder)

### Uninstalling
- Use Windows **Settings → Apps → DentiPOS → Uninstall**
- Or run the uninstaller from the installation directory
- Note: Uninstalling does NOT delete the database — client data is safe

### SmartScreen Warning
The app is not code-signed, so Windows will show a SmartScreen warning on first run. This is normal for unsigned desktop apps. To eliminate this, you would need to purchase a code signing certificate (~$200-400/year).
