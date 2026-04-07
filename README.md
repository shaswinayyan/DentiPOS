# 🦷 DentiPOS - Local Installation & Build Guide

DentiPOS is an offline-first dental clinic POS system built natively for speed and aesthetic excellence. It is engineered with **Electron**, **React**, and **BetterSQLite3** ensuring pure local operation without internet dependency.

Because DentiPOS operates securely on-premise, it needs to run as a desktop application on the clinic's local machines. Here are the step-by-step instructions to get it running directly on your Windows PC, as well as how to package it into an executable `.exe` file.

---

## 🚀 Easy Development Start (Running from Source)

If you simply want to download the folder and run it directly:

### 1. Requirements
Ensure you have **Node.js** installed on your system. 
- Download it here: [node.js (LTS version)](https://nodejs.org/)

### 2. Setup the application
1. Copy the `POS` folder directly to your Desktop or a workspace area (e.g. `C:\DentiPOS`).
2. Open your terminal or command prompt (cmd/powershell).
3. Navigate to the folder:
   ```cmd
   cd C:\DentiPOS
   ```
4. Install all the dependencies. You only have to do this once!
   ```cmd
   npm install --ignore-scripts
   npx electron-rebuild -f -w better-sqlite3
   ```
*(Note: we ignore default scripts initially to ensure the internal Electron database engine correctly compiles against Windows without requiring Python tools!)*

### 3. Launching DentiPOS
Once installed, starting the software is as simple as:
```cmd
npm start
```
The application window will pop up immediately. Enjoy your premium billing experience!

---

## 📦 Building a `.exe` Installer for Production

If you want to package the application so that your receptionists can install it easily using a standard installer file (`DentiPOS Setup.exe`), follow these steps:

### 1. Compile the User Interface
Before packaging, you must compile the React interface and the Electron background services.
```cmd
npm run build
```

### 2. Package into an Executable
We use a tool called `electron-builder` which was installed during the setup phase.
Run the following command:
```cmd
npx electron-builder --win
```

### 3. Retrieve your App!
Wait for the packaging to complete (this might take 1–3 minutes). Once done, look inside the newly created `dist/` folder inside your project.
You will find `dentipos Setup x.x.x.exe`. 

You can copy this `.exe` file to any standard Windows 10/11 clinic PC, double-click it, and it will install completely offline!
