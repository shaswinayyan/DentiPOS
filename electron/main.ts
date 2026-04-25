import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { setupDatabase } from './database';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#ffffff',
      symbolColor: '#74b1be',
      height: 48
    }
  });

  const dbService = setupDatabase(path.join(app.getPath('userData'), 'dentipos_v2.sqlite'));

  // IPC Handlers
  ipcMain.handle('get-settings', () => dbService.getSettings());
  ipcMain.handle('save-settings', (_, settings) => dbService.saveSettings(settings));
  ipcMain.handle('get-catalog', (_, type) => dbService.getCatalog(type));
  ipcMain.handle('save-catalog-item', (_, item) => dbService.saveCatalogItem(item));
  ipcMain.handle('delete-catalog-item', (_, id, type) => dbService.deleteCatalogItem(id, type));
  ipcMain.handle('save-transaction', (_, txn, items, payments, discounts) => 
    dbService.saveTransaction(txn, items, payments, discounts)
  );
  ipcMain.handle('get-transactions', () => dbService.getTransactions());
  ipcMain.handle('get-transaction-details', (_, id) => dbService.getTransactionDetails(id));

  ipcMain.on('print-receipt', (event) => {
    event.sender.print({
      silent: false,
      printBackground: true,
      deviceName: ''
    }, (success, errorType) => {
      if (!success) console.log('Print Failed', errorType);
    });
  });

  if (!app.isPackaged) {
    // Dev environment
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // Prod environment
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
