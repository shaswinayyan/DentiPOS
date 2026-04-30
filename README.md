# 🦷 DentiPOS - Point of Sale for Dental Clinics

DentiPOS is an offline-first dental clinic POS system built natively for speed and aesthetic excellence. It is engineered with **Electron**, **React**, and **BetterSQLite3** ensuring pure local operation without internet dependency.

This application includes a complete clinic treatment catalog dynamically pre-loaded, seamless billing integration, precise reporting, and secure native desktop application support.

---

## 📦 For Clients — Installing DentiPOS

**No coding or commands needed!** Just double-click the installer:

1. Get the **`DentiPOS Setup 1.0.0.exe`** file from the developer
2. Double-click it → if Windows SmartScreen appears, click **"More info"** → **"Run anyway"**
3. Choose installation folder → click **Install**
4. Launch DentiPOS from the **Start Menu** or **Desktop shortcut**

> **Portable option:** Use `DentiPOS-Portable-1.0.0.exe` instead — just double-click to run, no install needed.

---

## 🚀 For Developers — Running from Source

### 1. Requirements
- **Node.js 20 LTS** or newer — [Download here](https://nodejs.org/)
- **Windows Build Tools** (usually included with Node.js)

### 2. Setup
```cmd
git clone https://github.com/shaswinayyan/DentiPOS.git
cd DentiPOS
npm install
```

> ⚠️ **Do NOT use `npm install --ignore-scripts`** — Electron requires its postinstall script to download the binary. Always use plain `npm install`.

### 3. Launch (Development Mode)
```cmd
npm start
```
This spins up Vite + Electron concurrently, launching the desktop application with hot reload.

---

## 📦 Building the .exe Installer

To package the app for distribution to clients:

### 1. Build Everything
```cmd
npm run dist
```

### 2. Retrieve Your Installer
The `release/` folder will contain:

| File | Purpose |
|------|---------|
| **DentiPOS Setup 1.0.0.exe** | Full installer (Start Menu shortcuts, uninstaller) |
| **DentiPOS-Portable-1.0.0.exe** | Portable — just double-click, no installation |

Copy the `.exe` to a USB drive or cloud share and send to the client.

---

## 📁 Database Access & Backup

DentiPOS uses `better-sqlite3` for offline-first local data storage. The database is stored dynamically in the user's AppData directory.

**Database Location:**
- **Windows:** `%APPDATA%\DentiPOS\dentipos_v2.sqlite`
- **Mac:** `~/Library/Application Support/DentiPOS/dentipos_v2.sqlite`
- **Linux:** `~/.config/DentiPOS/dentipos_v2.sqlite`

*(Note: The exact AppData folder name may appear as `dentipos` depending on your environment, but it typically aligns with the `productName` in `package.json`).*

**How to Access the Database:**
1. Download and install a tool like [DB Browser for SQLite](https://sqlitebrowser.org/).
2. Open DB Browser.
3. Click "Open Database" and navigate to the location mentioned above.
4. From here, you can manually inspect, query, or modify the tables (e.g., `Treatment_Master`, `Transactions`).

**Backups:**
- Data persists across application updates.
- To safely back up your data, simply copy the `dentipos_v2.sqlite` file to a secure location (e.g., Google Drive, external USB).
