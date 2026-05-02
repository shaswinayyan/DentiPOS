import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings: any) => ipcRenderer.invoke('save-settings', settings),
  getCatalog: (type: string) => ipcRenderer.invoke('get-catalog', type),
  saveCatalogItem: (item: any) => ipcRenderer.invoke('save-catalog-item', item),
  deleteCatalogItem: (id: number, type: string) => ipcRenderer.invoke('delete-catalog-item', id, type),
  saveTransaction: (txn: any, items: any[], payments: any[], discounts: any[]) => 
    ipcRenderer.invoke('save-transaction', txn, items, payments, discounts),
  getTransactions: () => ipcRenderer.invoke('get-transactions'),
  getTransactionDetails: (id: number) => ipcRenderer.invoke('get-transaction-details', id),
  printReceipt: () => ipcRenderer.send('print-receipt'),
  printReceiptDirect: () => ipcRenderer.send('print-receipt-direct')
});
