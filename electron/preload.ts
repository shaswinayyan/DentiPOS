import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings: any) => ipcRenderer.invoke('save-settings', settings),
  getCatalog: (type: string) => ipcRenderer.invoke('get-catalog', type),
  saveCatalogItem: (item: any) => ipcRenderer.invoke('save-catalog-item', item),
  deleteCatalogItem: (id: number, type: string) => ipcRenderer.invoke('delete-catalog-item', id, type),
  saveTransaction: (txn: any, items: any[], payments: any[], discounts: any[]) => 
    ipcRenderer.invoke('save-transaction', txn, items, payments, discounts),
  savePrescriptions: (transactionId: number, prescriptions: any[]) =>
    ipcRenderer.invoke('save-prescriptions', transactionId, prescriptions),
  getPrescriptions: (transactionId: number) =>
    ipcRenderer.invoke('get-prescriptions', transactionId),
  saveClinicalRecord: (record: any, prescriptions: any[]) =>
    ipcRenderer.invoke('save-clinical-record', record, prescriptions),
  getClinicalRecords: () =>
    ipcRenderer.invoke('get-clinical-records'),
  getClinicalRecordDetails: (id: number) =>
    ipcRenderer.invoke('get-clinical-record-details', id),
  getDoctors: () => ipcRenderer.invoke('get-doctors'),
  saveDoctor: (doctor: any) => ipcRenderer.invoke('save-doctor', doctor),
  deleteDoctor: (id: number) => ipcRenderer.invoke('delete-doctor', id),
  getTransactions: () => ipcRenderer.invoke('get-transactions'),
  getTransactionDetails: (id: number) => ipcRenderer.invoke('get-transaction-details', id),
  getPrinters: () => ipcRenderer.invoke('get-printers'),
  printReceipt: () => ipcRenderer.send('print-receipt'),
  printReceiptDirect: () => ipcRenderer.send('print-receipt-direct'),
  printPosReceipt: (data: any[], width: string) => ipcRenderer.invoke('print-pos-receipt', data, width),
  printBillDocument: (html: string, pageSize: string) => ipcRenderer.invoke('print-bill-document', html, pageSize),
  saveBillPdf: (html: string, pageSize: string) => ipcRenderer.invoke('save-bill-pdf', html, pageSize),
  printBillRaw: (payload: any) => ipcRenderer.invoke('print-bill-raw', payload),
});
