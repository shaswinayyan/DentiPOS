import { useEffect, useState } from 'react';
import { Transaction } from '../types';
import { IndianRupee, TrendingUp, Calendar, Printer, Eye } from 'lucide-react';

export default function Reports() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [receiptTxn, setReceiptTxn] = useState<any>(null);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    if (window.api) {
      setTransactions(await window.api.getTransactions());
    }
  };

  const loadReceipt = async (id: number) => {
    if (window.api) {
      const data = await window.api.getTransactionDetails(id);
      const settings = await window.api.getSettings();
      setReceiptTxn({
        ...data.transaction,
        cart: data.items,
        payments: data.payments,
        calculatedDiscount: data.transaction.discount_amount,
        settings: settings
      });
    }
  };

  const handlePrint = () => {
    if (window.api) {
      window.api.printReceipt();
    } else {
      window.print();
    }
  };

  const totalRevenue = transactions.reduce((sum, t) => sum + t.final_amount, 0);
  const totalDiscounts = transactions.reduce((sum, t) => sum + t.discount_amount, 0);
  const totalTxns = transactions.length;

  if (receiptTxn) {
    return (
      <div style={{ maxWidth: '400px', margin: '0 auto', background: '#fff', color: '#000', padding: '24px', borderRadius: '8px' }} id="receipt-area">
        <h2 style={{ textAlign: 'center', marginBottom: '8px' }}>{receiptTxn.settings?.clinic_name || 'Clinic'}</h2>
        <p style={{ textAlign: 'center', fontSize: '0.9rem', marginBottom: '16px' }}>{receiptTxn.settings?.clinic_address}</p>
        
        <p><strong>Txn ID:</strong> #{receiptTxn.id}</p>
        <p style={{ marginBottom: '16px' }}><strong>Date:</strong> {new Date(receiptTxn.timestamp).toLocaleString()}</p>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
          <thead>
            <tr style={{ borderBottom: '1px dashed #000' }}>
              <th style={{ textAlign: 'left', padding: '4px 0' }}>Item</th>
              <th style={{ textAlign: 'right', padding: '4px 0' }}>Amt</th>
            </tr>
          </thead>
          <tbody>
            {receiptTxn.cart.map((item: any, i: number) => (
              <tr key={i}>
                <td style={{ padding: '4px 0', fontSize: '0.9rem' }}>{item.item_name} <small>x{item.quantity}</small></td>
                <td style={{ textAlign: 'right', fontSize: '0.9rem' }}>₹{item.total_price.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div style={{ borderTop: '1px dashed #000', paddingTop: '8px', textAlign: 'right' }}>
          <p>Subtotal: ₹{receiptTxn.total_amount.toFixed(2)}</p>
          {receiptTxn.calculatedDiscount > 0 && <p>Discount: -₹{receiptTxn.calculatedDiscount.toFixed(2)}</p>}
          <h3 style={{ marginTop: '8px' }}>Total: ₹{receiptTxn.final_amount.toFixed(2)}</h3>
        </div>

        <p style={{ textAlign: 'center', marginTop: '24px', fontStyle: 'italic' }}>Thank you for visiting!</p>
        
        <div style={{ display: 'flex', gap: '16px', marginTop: '24px', justifyContent: 'center' }} className="no-print">
          <button className="btn btn-primary" onClick={handlePrint}><Printer size={16}/> Print</button>
          <button className="btn btn-outline" onClick={() => setReceiptTxn(null)}>Back to Reports</button>
        </div>

        <style>{`
          @media print {
            body * { visibility: hidden; }
            .layout * { display: none !important; }
            #receipt-area, #receipt-area * { visibility: visible; display: block; }
            #receipt-area { position: absolute; left: 0; top: 0; width: 100%; }
            .no-print { display: none !important; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ marginBottom: '24px', fontSize: '1.8rem' }}>Reports Dashboard</h1>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(0,108,250,0.1)', color: 'var(--primary-color)', padding: '16px', borderRadius: '50%' }}>
            <IndianRupee size={32} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>Total Revenue</p>
            <h2 style={{ fontSize: '1.8rem' }}>₹{totalRevenue.toFixed(2)}</h2>
          </div>
        </div>
        
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(0,169,86,0.1)', color: 'var(--success-color)', padding: '16px', borderRadius: '50%' }}>
            <TrendingUp size={32} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>Transactions</p>
            <h2 style={{ fontSize: '1.8rem' }}>{totalTxns}</h2>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(250,62,62,0.1)', color: 'var(--danger-color)', padding: '16px', borderRadius: '50%' }}>
            <Calendar size={32} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '4px' }}>Discounts Given</p>
            <h2 style={{ fontSize: '1.8rem' }}>₹{totalDiscounts.toFixed(2)}</h2>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="card">
        <h2 style={{ marginBottom: '16px', fontSize: '1.2rem' }}>Recent Transactions</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
              <th style={{ padding: '12px 0', color: 'var(--text-muted)' }}>ID</th>
              <th style={{ padding: '12px 0', color: 'var(--text-muted)' }}>Date & Time</th>
              <th style={{ padding: '12px 0', color: 'var(--text-muted)' }}>Subtotal</th>
              <th style={{ padding: '12px 0', color: 'var(--text-muted)' }}>Discount</th>
              <th style={{ padding: '12px 0', color: 'var(--text-muted)' }}>Final Amount</th>
              <th style={{ padding: '12px 0', color: 'var(--text-muted)' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(t => (
              <tr key={t.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '12px 0', fontWeight: 500 }}>#{t.id}</td>
                <td style={{ padding: '12px 0' }}>{new Date(t.timestamp).toLocaleString()}</td>
                <td style={{ padding: '12px 0' }}>₹{t.total_amount.toFixed(2)}</td>
                <td style={{ padding: '12px 0', color: 'var(--danger-color)' }}>₹{t.discount_amount.toFixed(2)}</td>
                <td style={{ padding: '12px 0', fontWeight: 'bold', color: 'var(--success-color)' }}>₹{t.final_amount.toFixed(2)}</td>
                <td style={{ padding: '12px 0' }}>
                  <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.9rem' }} onClick={() => loadReceipt(t.id)}>
                    <Eye size={16} /> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {transactions.length === 0 && (
          <p style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No transactions yet.</p>
        )}
      </div>

    </div>
  );
}
