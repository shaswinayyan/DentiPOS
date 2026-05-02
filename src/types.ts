export interface Transaction {
  id: number;
  timestamp: string;
  total_amount: number;
  discount_amount: number;
  final_amount: number;
  patient_name?: string;
  patient_phone?: string;
  chief_complaint?: string;
}

export interface TransactionItem {
  id?: number;
  transaction_id?: number;
  item_name: string;
  category: string; // 'Consultation' | 'Treatment' | 'Medicine' | 'Custom'
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Payment {
  id?: number;
  transaction_id?: number;
  payment_mode: string; // 'Cash' | 'UPI' | 'Card'
  amount: number;
}

export interface Discount {
  id?: number;
  transaction_id?: number;
  type: string; // 'flat' | 'percentage'
  value: number;
}

export interface Prescription {
  id?: number;
  transaction_id?: number;
  clinical_record_id?: number;
  medication_name: string;
  dosage_morning: number;
  dosage_afternoon: number;
  dosage_night: number;
  timing: 'Before Food' | 'After Food';
  duration_days: number;
}

export interface ClinicalRecord {
  id?: number;
  timestamp: string;
  patient_name: string;
  patient_phone: string;
  chief_complaint: string;
  doctor_name?: string;
  op_id?: string;
}

export interface Doctor {
  id: number;
  name: string;
}

export interface CatalogItem {
  id: number;
  name: string;
  price: number;
  type: 'treatment' | 'medicine';
  category?: string;
}

export interface Settings {
  id?: number;
  consultation_fee: number;
  gst_enabled: number; // 0 or 1
  allow_price_override: number; // 0 or 1
  allow_discount: number; // 0 or 1
  clinic_name: string;
  clinic_address: string;
  pos_margin_left: number;
  pos_paper_width: number;
  pos_printer_name?: string;
  pos_print_mode?: 'raw' | 'driver';
}

// IPC Interface
export interface ElectronAPI {
  getSettings: () => Promise<Settings>;
  saveSettings: (settings: Settings) => Promise<boolean>;
  getCatalog: (type: 'treatment' | 'medicine') => Promise<CatalogItem[]>;
  saveCatalogItem: (item: Partial<CatalogItem>) => Promise<boolean>;
  deleteCatalogItem: (id: number, type: 'treatment' | 'medicine') => Promise<boolean>;
  saveTransaction: (
    transaction: Omit<Transaction, 'id'>, 
    items: TransactionItem[], 
    payments: Payment[],
    discounts: Discount[]
  ) => Promise<{success: boolean; transactionId?: number}>;
  savePrescriptions: (transactionId: number, prescriptions: Prescription[]) => Promise<boolean>;
  getPrescriptions: (transactionId: number) => Promise<Prescription[]>;
  saveClinicalRecord: (record: Omit<ClinicalRecord, 'id'>, prescriptions: Prescription[]) => Promise<{success: boolean; clinicalRecordId?: number}>;
  getClinicalRecords: () => Promise<ClinicalRecord[]>;
  getClinicalRecordDetails: (id: number) => Promise<{
    record: ClinicalRecord,
    prescriptions: Prescription[]
  }>;
  getDoctors: () => Promise<Doctor[]>;
  saveDoctor: (doctor: Partial<Doctor>) => Promise<boolean>;
  deleteDoctor: (id: number) => Promise<boolean>;
  getTransactions: () => Promise<Transaction[]>;
  getPrinters: () => Promise<Array<{ name: string; isDefault?: boolean; status?: number }>>;
  getTransactionDetails: (id: number) => Promise<{
    transaction: Transaction,
    items: TransactionItem[],
    payments: Payment[],
    discounts: Discount[],
    prescriptions: Prescription[]
  }>;
  printReceipt: () => void;
  printReceiptDirect: () => void;
  printPosReceipt: (data: any[], width: string) => Promise<{ success: boolean; mode?: string; printerName?: string; error?: string }>;
  printBillDocument: (html: string, pageSize: string) => Promise<{ success: boolean; error?: string }>;
  saveBillPdf: (html: string, pageSize: string) => Promise<{ success: boolean; filePath?: string; error?: string }>;
  printBillRaw: (payload: any) => Promise<{ success: boolean; printerName?: string; error?: string }>;
}

declare global {
  interface Window {
    api: ElectronAPI;
  }
}
