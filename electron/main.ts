import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import fs from 'fs';
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

  ipcMain.on('print-receipt', async (event) => {
    try {
      const pdfBuffer = await event.sender.printToPDF({
        printBackground: false,
        pageSize: 'A4',
        margins: { marginType: 'default' }
      });
      
      const { filePath } = await dialog.showSaveDialog({
        title: 'Save Bill PDF',
        defaultPath: path.join(app.getPath('downloads'), `bill_${Date.now()}.pdf`),
        filters: [{ name: 'PDFs', extensions: ['pdf'] }]
      });
      
      if (filePath) {
        fs.writeFileSync(filePath, pdfBuffer);
        await shell.openPath(filePath);
      }
    } catch (error) {
      console.error('Failed to generate PDF', error);
    }
  });

  ipcMain.on('print-receipt-direct', async (event) => {
    try {
      event.sender.print({
        silent: false, // Show dialog for POS printer selection
        printBackground: false,
        margins: { marginType: 'none' }
      });
    } catch (error) {
      console.error('Failed to print to POS', error);
    }
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
