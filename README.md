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

## 📁 Data & Backup

- Database location: `%APPDATA%/dentipos/dentipos_v2.sqlite`
- Data persists across app updates
- To backup: copy the `.sqlite` file at that path
