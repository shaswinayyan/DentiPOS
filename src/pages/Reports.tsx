import { useEffect, useState } from 'react';
import { Transaction } from '../types';
import { IndianRupee, TrendingUp, Calendar, Printer, Eye } from 'lucide-react';

export default function Reports() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [receiptTxn, setReceiptTxn] = useState<any>(null);
  const [printTarget, setPrintTarget] = useState<'bill' | 'rx' | null>(null);

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
        settings: settings,
        prescriptions: data.prescriptions || []
      });
    }
  };

  const handlePrintBillPOS = () => {
    if (!window.api || !receiptTxn) return;
    const paperWidth = receiptTxn.settings?.pos_paper_width || 58;
    const width = `${paperWidth}mm`;
    const data: any[] = [
      { type: 'text', value: receiptTxn.settings?.clinic_name || 'Clinic', style: { textAlign: 'center', fontWeight: '700', fontSize: '16px' } },
      { type: 'text', value: receiptTxn.settings?.clinic_address || '', style: { textAlign: 'center', fontSize: '11px' } },
      { type: 'text', value: `Txn ID: #${receiptTxn.id}`, style: { textAlign: 'left', marginTop: '6px' } },
      { type: 'text', value: `Date: ${new Date(receiptTxn.timestamp).toLocaleString()}`, style: { textAlign: 'left' } },
      ...(receiptTxn.patient_name ? [{ type: 'text', value: `Patient: ${receiptTxn.patient_name}`, style: { textAlign: 'left', marginBottom: '6px' } }] : []),
      { type: 'text', value: '--------------------------------', style: { textAlign: 'center' } },
    ];

    receiptTxn.cart.forEach((item: any) => {
      const qtyLabel = item.quantity > 1 ? ` x${item.quantity}` : '';
      data.push(
        { type: 'text', value: `${item.item_name}${qtyLabel}`, style: { textAlign: 'left', fontSize: '12px' } },
        { type: 'text', value: `Rs ${item.total_price.toFixed(2)}`, style: { textAlign: 'right', fontSize: '12px' } }
      );
    });

    data.push(
      { type: 'text', value: '--------------------------------', style: { textAlign: 'center', marginTop: '4px' } },
      { type: 'text', value: `Subtotal: Rs ${receiptTxn.total_amount.toFixed(2)}`, style: { textAlign: 'right' } }
    );
    if (receiptTxn.calculatedDiscount > 0) {
      data.push({ type: 'text', value: `Discount: -Rs ${receiptTxn.calculatedDiscount.toFixed(2)}`, style: { textAlign: 'right' } });
    }
    data.push(
      { type: 'text', value: `Total: Rs ${receiptTxn.final_amount.toFixed(2)}`, style: { textAlign: 'right', fontWeight: '700', fontSize: '14px' } },
      { type: 'text', value: 'Thank you for visiting!', style: { textAlign: 'center', marginTop: '8px', marginBottom: '8px' } }
    );

    window.api.printPosReceipt(data, width);
  };

  const handlePrintRxA4 = () => {
    setPrintTarget('rx');
    setTimeout(() => {
      window.print();
      setTimeout(() => setPrintTarget(null), 100);
    }, 100);
  };

  const totalRevenue = transactions.reduce((sum, t) => sum + t.final_amount, 0);
  const totalDiscounts = transactions.reduce((sum, t) => sum + t.discount_amount, 0);
  const totalTxns = transactions.length;

  if (receiptTxn) {
    const leftMargin = receiptTxn.settings?.pos_margin_left || 0;
    const paperWidth = receiptTxn.settings?.pos_paper_width || 58;

    return (
      <div style={{ padding: '24px', display: 'flex', gap: '24px', flexDirection: 'column', alignItems: 'center' }}>
        <div className="no-print" style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
           <button className="btn btn-primary" onClick={handlePrintBillPOS}><Printer size={16}/> Print Bill (POS)</button>
           {receiptTxn.prescriptions?.length > 0 && (
             <button className="btn btn-primary" onClick={handlePrintRxA4}><Printer size={16}/> Print Prescription (A4)</button>
           )}
           <button className="btn btn-outline" onClick={() => setReceiptTxn(null)}>Back to Reports</button>
        </div>

        {/* Bill Receipt Area */}
        <div 
           id="bill-area"
           style={{ 
             background: '#fff', color: '#000', padding: '16px', borderRadius: '8px', 
             width: '300px', border: '1px solid #ddd',
             display: printTarget === 'rx' ? 'none' : 'block'
           }}
        >
          <h2 style={{ textAlign: 'center', marginBottom: '4px', fontSize: '1.2rem' }}>{receiptTxn.settings?.clinic_name || 'Clinic'}</h2>
          <p style={{ textAlign: 'center', fontSize: '0.85rem', marginBottom: '12px' }}>{receiptTxn.settings?.clinic_address}</p>
          
          <div style={{ fontSize: '0.9rem', marginBottom: '12px' }}>
            <p><strong>Txn ID:</strong> #{receiptTxn.id}</p>
            <p><strong>Date:</strong> {new Date(receiptTxn.timestamp).toLocaleString()}</p>
            {receiptTxn.patient_name && <p><strong>Patient:</strong> {receiptTxn.patient_name}</p>}
          </div>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px dashed #000' }}>
                <th style={{ textAlign: 'left', padding: '4px 0' }}>Item</th>
                <th style={{ textAlign: 'right', padding: '4px 0' }}>Amt</th>
              </tr>
            </thead>
            <tbody>
              {receiptTxn.cart.map((item: any, i: number) => (
                <tr key={i}>
                  <td style={{ padding: '4px 0', wordBreak: 'break-word', whiteSpace: 'normal' }}>
                    {item.item_name} {item.quantity > 1 ? `x${item.quantity}` : ''}
                  </td>
                  <td style={{ textAlign: 'right', verticalAlign: 'top' }}>₹{item.total_price.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div style={{ borderTop: '1px dashed #000', paddingTop: '8px', textAlign: 'right', fontSize: '0.9rem' }}>
            <p>Subtotal: ₹{receiptTxn.total_amount.toFixed(2)}</p>
            {receiptTxn.calculatedDiscount > 0 && <p>Discount: -₹{receiptTxn.calculatedDiscount.toFixed(2)}</p>}
            <h3 style={{ marginTop: '4px', fontSize: '1.1rem' }}>Total: ₹{receiptTxn.final_amount.toFixed(2)}</h3>
          </div>

          <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.85rem', fontStyle: 'italic' }}>Thank you for visiting!</p>
        </div>

        {/* Prescription Slip Area */}
        {receiptTxn.prescriptions?.length > 0 && (
          <div 
             id="rx-area"
             style={{ 
               background: '#fff', color: '#000', padding: '40px', borderRadius: '8px', 
               width: '800px', border: '1px solid #ddd',
               display: printTarget === 'bill' ? 'none' : 'block'
             }}
          >
            <h2 style={{ textAlign: 'center', marginBottom: '8px', fontSize: '1.5rem', color: '#2c3e50' }}>{receiptTxn.settings?.clinic_name || 'Clinic'}</h2>
            <p style={{ textAlign: 'center', fontSize: '1rem', marginBottom: '24px', color: '#7f8c8d' }}>{receiptTxn.settings?.clinic_address}</p>
            
            <h3 style={{ borderBottom: '2px solid #3498db', paddingBottom: '8px', marginBottom: '20px' }}>Prescription</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div>
                <p><strong>Patient Name:</strong> {receiptTxn.patient_name || 'N/A'}</p>
                <p><strong>Phone:</strong> {receiptTxn.patient_phone || 'N/A'}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p><strong>Date:</strong> {new Date(receiptTxn.timestamp).toLocaleDateString()}</p>
                <p><strong>Txn ID:</strong> #{receiptTxn.id}</p>
              </div>
            </div>

            {receiptTxn.chief_complaint && (
              <div style={{ marginBottom: '24px' }}>
                <strong>Chief Complaint:</strong>
                <p style={{ marginTop: '4px', whiteSpace: 'pre-wrap' }}>{receiptTxn.chief_complaint}</p>
              </div>
            )}

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '32px' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                  <th style={{ textAlign: 'left', padding: '12px', width: '40%' }}>Medicine</th>
                  <th style={{ textAlign: 'center', padding: '12px' }}>Dosage (M-A-N)</th>
                  <th style={{ textAlign: 'center', padding: '12px' }}>Timing</th>
                  <th style={{ textAlign: 'center', padding: '12px' }}>Duration</th>
                </tr>
              </thead>
              <tbody>
                {receiptTxn.prescriptions.map((rx: any, i: number) => (
                  <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{rx.medication_name}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>{rx.dosage_morning} - {rx.dosage_afternoon} - {rx.dosage_night}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>{rx.timing}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>{rx.duration_days} Days</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: '60px', textAlign: 'right' }}>
              <p>_______________________</p>
              <p style={{ marginTop: '8px' }}>Doctor's Signature</p>
            </div>
          </div>
        )}

        <style>{`
          @media print {
            body { background: white !important; color: black !important; margin: 0; padding: 0; }
            body * { visibility: hidden; }
            .no-print { display: none !important; }
            
            ${printTarget === 'bill' ? `
              #bill-area, #bill-area * { visibility: visible; }
              #bill-area { 
                position: absolute !important; 
                left: 0 !important; 
                top: 0 !important; 
                margin: 0 !important;
                width: ${paperWidth}mm !important;
                padding: 0 !important;
                padding-left: ${leftMargin}mm !important;
                border: none !important;
                font-size: 12px;
                box-sizing: border-box;
              }
              @page { size: ${paperWidth}mm auto; margin: 0; }
            ` : ''}

            ${printTarget === 'rx' ? `
              #rx-area, #rx-area * { visibility: visible; }
              #rx-area { 
                position: absolute !important; 
                left: 0 !important; 
                top: 0 !important; 
                width: 100% !important;
                border: none !important;
                padding: 20px !important;
                box-sizing: border-box;
              }
              @page { size: A4; margin: 20mm; }
            ` : ''}
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
              <th style={{ padding: '12px 0', color: 'var(--text-muted)' }}>Patient</th>
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
                <td style={{ padding: '12px 0' }}>{t.patient_name || '-'}</td>
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
