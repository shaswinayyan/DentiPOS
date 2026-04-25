# 🦷 DentiPOS - Point of Sale for Dental Clinics

DentiPOS is an offline-first dental clinic POS system built natively for speed and aesthetic excellence. It is engineered with **Electron**, **React**, and **BetterSQLite3** ensuring pure local operation without internet dependency.

This application includes a complete clinic treatment catalog dynamically pre-loaded, seamless billing integration, precise reporting, and secure native desktop application support.

---

## 🚀 Easy Development Start (Running from Source)

To download the repository and run it locally for active development:

### 1. Requirements
Ensure you have **Node.js** installed on your system. 
- Download it here: [node.js (LTS version)](https://nodejs.org/)

### 2. Setup the Application
1. Clone or download the `POS` repository to your local workspace.
2. Open your terminal or command prompt inside the project folder.
3. Install all dependencies and rebuild native SQLite extensions:
   ```cmd
   npm install --ignore-scripts
   npm run postinstall
   ```

### 3. Launching DentiPOS
Starting the software during development is simple:
```cmd
npm start
```
This commands spins up Vite and Electron concurrently, launching your native desktop application. All procedures and treatments are immediately seeded into your local database!

---

## 📦 Building a `.exe` Installer for Production

If you want to package the application to install it easily across standard Windows stations (`DentiPOS Setup.exe`), we have integrated `electron-builder`.

### 1. Execute the Build Script
Compile the React frontend, the Electron backend, and assemble the installer all in one command:
```cmd
npm run dist
```

### 2. Retrieve your Application
Wait for the packaging to finish. The process creates both a portable application and an installer. 
Once complete, open the `release/` folder inside your project:
- **DentiPOS Setup 1.0.0.exe**: The unified installer application.
- **DentiPOS 1.0.0.exe**: A portable, directly executable file.

Copy these `.exe` files to any standard Windows 10/11 clinic PC, double-click, and enjoy a premium offline billing experience!
