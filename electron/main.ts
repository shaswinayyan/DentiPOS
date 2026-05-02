import { app, BrowserWindow, ipcMain, dialog, shell, type WebContents } from 'electron';
import fs from 'fs';
import path from 'path';
import { setupDatabase } from './database';
import { PosPrinter } from 'electron-pos-printer';

let mainWindow: BrowserWindow | null = null;

const pickDefaultPrinterName = async (sender: WebContents): Promise<string> => {
  const printers = await sender.getPrintersAsync();
  const defaultPrinter = printers.find((p) => p.isDefault) || printers[0];
  return defaultPrinter?.name || '';
};

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
  ipcMain.handle('save-prescriptions', (_, transactionId, prescriptions) =>
    dbService.savePrescriptions(transactionId, prescriptions)
  );
  ipcMain.handle('get-prescriptions', (_, transactionId) =>
    dbService.getPrescriptions(transactionId)
  );
  ipcMain.handle('save-clinical-record', (_, record, prescriptions) =>
    dbService.saveClinicalRecord(record, prescriptions)
  );
  ipcMain.handle('get-clinical-records', () =>
    dbService.getClinicalRecords()
  );
  ipcMain.handle('get-clinical-record-details', (_, id) =>
    dbService.getClinicalRecordDetails(id)
  );
  ipcMain.handle('get-doctors', () => dbService.getDoctors());
  ipcMain.handle('save-doctor', (_, doctor) => dbService.saveDoctor(doctor));
  ipcMain.handle('delete-doctor', (_, id) => dbService.deleteDoctor(id));
  
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
        silent: false,
        printBackground: false,
        margins: { marginType: 'none' }
      });
    } catch (error) {
      console.error('Failed to print to POS', error);
    }
  });

  ipcMain.handle('print-pos-receipt', async (event, data, widthString) => {
    try {
      const width = widthString || '58mm';
      const printerName = await pickDefaultPrinterName(event.sender);
      const printOptions = {
        preview: false,
        margin: '0 0 0 0',
        copies: 1,
        printerName,
        timeOutPerLine: 300,
        pageSize: width,
        silent: true
      };

      try {
        await PosPrinter.print(data, printOptions);
        return { success: true, mode: 'pos', printerName };
      } catch (posError) {
        // Retry once with 80mm because some Windows drivers reject 58mm custom page sizes.
        await PosPrinter.print(data, { ...printOptions, pageSize: '80mm' });
        return { success: true, mode: 'pos-fallback-80mm', printerName };
      }
    } catch (error) {
      console.error('Failed to print POS receipt via electron-pos-printer', error);
      try {
        const printerName = await pickDefaultPrinterName(event.sender);
        const ok = await new Promise<boolean>((resolve) => {
          event.sender.print(
            {
              silent: false,
              printBackground: false,
              margins: { marginType: 'none' },
              deviceName: printerName || undefined
            },
            (success) => resolve(success)
          );
        });

        if (ok) {
          return { success: true, mode: 'system-dialog-fallback', printerName };
        }
      } catch (fallbackError) {
        console.error('Fallback system print also failed', fallbackError);
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown POS print failure'
      };
    }
  });

  if (!app.isPackaged) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
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
