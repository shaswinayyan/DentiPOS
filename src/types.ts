export interface Transaction {
  id: number;
  timestamp: string;
  total_amount: number;
  discount_amount: number;
  final_amount: number;
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
  getTransactions: () => Promise<Transaction[]>;
  getTransactionDetails: (id: number) => Promise<{
    transaction: Transaction,
    items: TransactionItem[],
    payments: Payment[],
    discounts: Discount[]
  }>;
  printReceipt: () => void;
  printReceiptDirect: () => void;
}

declare global {
  interface Window {
    api: ElectronAPI;
  }
}
