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

const parseCustomSize = (input?: string): { widthMicrons: number; heightMicrons: number } | null => {
  if (!input) return null;
  const normalized = input.trim().toLowerCase();
  const match = normalized.match(/^(\d+(?:\.\d+)?)\s*[x*]\s*(\d+(?:\.\d+)?)$/);
  if (!match) return null;
  const widthMm = Number(match[1]);
  const heightMm = Number(match[2]);
  if (!Number.isFinite(widthMm) || !Number.isFinite(heightMm) || widthMm <= 0 || heightMm <= 0) return null;
  return {
    widthMicrons: Math.round(widthMm * 1000),
    heightMicrons: Math.round(heightMm * 1000)
  };
};

const parsePosPageSize = (input?: string): string | { width: number; height: number } => {
  const custom = parseCustomSize(input);
  if (!custom) return input || '58mm';
  // Approximate 203 DPI thermal printers at 8 dots/mm.
  const widthPx = Math.max(200, Math.round((custom.widthMicrons / 1000) * 8));
  const heightPx = Math.max(120, Math.round((custom.heightMicrons / 1000) * 8));
  return { width: widthPx, height: heightPx };
};

const createPrintWindow = async (html: string) => {
  const win = new BrowserWindow({
    show: false,
    webPreferences: {
      sandbox: true
    }
  });
  await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
  await new Promise<void>((resolve) => {
    if (win.webContents.isLoading()) {
      win.webContents.once('did-finish-load', () => resolve());
    } else {
      resolve();
    }
  });
  return win;
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
      const width = parsePosPageSize(widthString || '58mm');
      const printerName = await pickDefaultPrinterName(event.sender);
      const printOptions: any = {
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

  ipcMain.handle('print-bill-document', async (event, html: string, pageSize: string) => {
    let printWindow: BrowserWindow | null = null;
    try {
      printWindow = await createPrintWindow(html);
      const printerName = await pickDefaultPrinterName(event.sender);
      const custom = parseCustomSize(pageSize);
      const success = await new Promise<boolean>((resolve) => {
        printWindow!.webContents.print(
          {
            silent: false,
            printBackground: true,
            deviceName: printerName || undefined,
            pageSize: custom
              ? { width: custom.widthMicrons, height: custom.heightMicrons }
              : undefined,
            margins: { marginType: 'none' }
          },
          (ok) => resolve(ok)
        );
      });
      return { success };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unable to print bill document' };
    } finally {
      if (printWindow && !printWindow.isDestroyed()) {
        printWindow.close();
      }
    }
  });

  ipcMain.handle('save-bill-pdf', async (_, html: string, pageSize: string) => {
    let pdfWindow: BrowserWindow | null = null;
    try {
      pdfWindow = await createPrintWindow(html);
      const custom = parseCustomSize(pageSize);
      const pdfBuffer = await pdfWindow.webContents.printToPDF({
        printBackground: true,
        pageSize: custom
          ? { width: custom.widthMicrons, height: custom.heightMicrons }
          : 'A4',
        margins: { marginType: 'none' },
        preferCSSPageSize: true
      });

      const defaultName = `bill_${Date.now()}.pdf`;
      const { filePath } = await dialog.showSaveDialog({
        title: 'Save Bill PDF',
        defaultPath: path.join(app.getPath('downloads'), defaultName),
        filters: [{ name: 'PDFs', extensions: ['pdf'] }]
      });
      if (!filePath) return { success: false, error: 'Save cancelled' };

      fs.writeFileSync(filePath, pdfBuffer);
      await shell.openPath(filePath);
      return { success: true, filePath };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unable to save bill PDF' };
    } finally {
      if (pdfWindow && !pdfWindow.isDestroyed()) {
        pdfWindow.close();
      }
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
