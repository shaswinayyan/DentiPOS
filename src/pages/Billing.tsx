import { useState, useEffect } from 'react';
import { CatalogItem, Settings as SettingsType, TransactionItem, Payment, Discount } from '../types';
import { ShoppingCart, Plus, IndianRupee, Printer, Trash2, Tag } from 'lucide-react';

export default function Billing() {
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [treatments, setTreatments] = useState<CatalogItem[]>([]);
  const [medicines, setMedicines] = useState<CatalogItem[]>([]);
  const [cart, setCart] = useState<TransactionItem[]>([]);
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [discountType, setDiscountType] = useState<'flat' | 'percentage'>('flat');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [receiptTxn, setReceiptTxn] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (window.api) {
      setSettings(await window.api.getSettings());
      setTreatments(await window.api.getCatalog('treatment'));
      setMedicines(await window.api.getCatalog('medicine'));
    }
  };

  const addConsultation = () => {
    if (!settings) return;
    addToCart({
      item_name: 'Consultation Fee',
      category: 'Consultation',
      quantity: 1,
      unit_price: settings.consultation_fee,
      total_price: settings.consultation_fee
    });
  };

  const addCatalogItem = (item: CatalogItem) => {
    addToCart({
      item_name: item.name,
      category: item.type === 'treatment' ? 'Treatment' : 'Medicine',
      quantity: 1,
      unit_price: item.price,
      total_price: item.price
    });
  };

  const addCustomItem = () => {
    const name = prompt("Enter Custom Item Name:");
    if (!name) return;
    const priceStr = prompt("Enter Price:");
    if (!priceStr) return;
    const price = parseFloat(priceStr);

    addToCart({
      item_name: name,
      category: 'Custom',
      quantity: 1,
      unit_price: price,
      total_price: price
    });
  };

  const addToCart = (item: TransactionItem) => {
    setCart([...cart, { ...item, id: Date.now() }]); 
  };

  const updateItemPrice = (index: number, newPrice: number) => {
    if (!settings?.allow_price_override) return;
    const newCart = [...cart];
    newCart[index].unit_price = newPrice;
    newCart[index].total_price = newPrice * newCart[index].quantity;
    setCart(newCart);
  };

  const updateItemQty = (index: number, newQty: number) => {
    const newCart = [...cart];
    newCart[index].quantity = newQty;
    newCart[index].total_price = newCart[index].unit_price * newQty;
    setCart(newCart);
  };

  const removeCartItem = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.total_price, 0);
  
  const treatmentGroups = treatments.reduce((acc, t) => {
    const cat = t.category || 'Uncategorized';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(t);
    return acc;
  }, {} as Record<string, CatalogItem[]>);

  let calculatedDiscount = 0;
  if (discountType === 'flat') calculatedDiscount = discountValue;
  if (discountType === 'percentage') calculatedDiscount = (subtotal * discountValue) / 100;
  
  const finalAmount = subtotal - calculatedDiscount;

  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Cart is empty");
    setShowPaymentModal(true);
  };

  const processPayment = async () => {
    if (!window.api) return;
    const txn = {
      timestamp: new Date().toISOString(),
      total_amount: subtotal,
      discount_amount: calculatedDiscount,
      final_amount: finalAmount
    };
    
    const payments: Payment[] = [{ payment_mode: paymentMode, amount: finalAmount }];
    const discounts: Discount[] = calculatedDiscount > 0 ? [{ type: discountType, value: discountValue }] : [];

    const res = await window.api.saveTransaction(txn, cart, payments, discounts);
    
    if (res.success && res.transactionId) {
      setReceiptTxn({ 
        ...txn, 
        id: res.transactionId, 
        cart, 
        payments, 
        calculatedDiscount, 
        settings
      });
      
      // Reset form
      setCart([]);
      setDiscountValue(0);
      setShowPaymentModal(false);
    } else {
      alert("Transaction failed");
    }
  };

  const handlePrintBillPOS = async () => {
    if (!window.api || !receiptTxn) return;
    const api = window.api as any;
    if (typeof api.printBillDocumentDirect === 'function') {
      api.printBillDocumentDirect(getBillDocumentHtml(), 'normal');
      return;
    }
    alert('Print API missing. Please restart app.');
  };

  const handlePrintBillSystem = async () => {
    await handlePrintBillPOS();
  };

  const getBillDocumentHtml = () => {
    if (!receiptTxn) return '';
    const rows = receiptTxn.cart
      .map((item: any) => {
        const qtyLabel = item.quantity > 1 ? ` x${item.quantity}` : '';
        return `<tr><td>${item.item_name}${qtyLabel}</td><td style="text-align:right;">Rs ${item.total_price.toFixed(2)}</td></tr>`;
      })
      .join('');

    return `<!doctype html><html><head><meta charset="utf-8"/><style>
      @page { size: 48mm 1200mm; margin: 0; }
      html, body {
        width: 48mm;
        min-width: 48mm;
        max-width: 48mm;
        margin: 0;
        padding: 0;
        background: #fff;
      }
      body {
        font-family: Arial, sans-serif;
        color: #000;
        font-size: 12px;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .page {
        width: 48mm;
        min-width: 48mm;
        max-width: 48mm;
        padding: 2mm;
        box-sizing: border-box;
        overflow: hidden;
      }
      .receipt { width: 44mm; max-width: 44mm; padding: 0; box-sizing: border-box; }
      h1 { margin:0 0 4px; text-align:center; font-size:15px; }
      p { margin:4px 0; }
      table { width:100%; border-collapse:collapse; margin:10px 0; }
      th, td { padding:4px 0; vertical-align:top; }
      th { text-align:left; border-bottom: 1px dashed #000; }
      .line { border-top:1px dashed #000; margin:8px 0; }
      .right { text-align:right; }
      .total { font-weight:700; font-size:14px; }
      .center { text-align:center; }
      .toolbar {
        position: sticky;
        top: 0;
        display: flex;
        gap: 8px;
        padding: 8px;
        background: #f5f5f5;
        border-bottom: 1px solid #ddd;
        width: 100vw;
        box-sizing: border-box;
      }
      .toolbar button {
        padding: 6px 10px;
        font-size: 12px;
      }
      @media print {
        .toolbar { display: none; }
      }
    </style></head><body>
      <div class="toolbar">
        <button onclick="window.print()">Print</button>
        <button onclick="window.close()">Close</button>
      </div>
      <div class="page">
      <div class="receipt">
        <h1>${receiptTxn.settings?.clinic_name || 'Clinic'}</h1>
        <p class="center">${receiptTxn.settings?.clinic_address || ''}</p>
        <div class="line"></div>
        <p><strong>Txn ID:</strong> #${receiptTxn.id}</p>
        <p><strong>Date:</strong> ${new Date(receiptTxn.timestamp).toLocaleString()}</p>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th class="right">Amt</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="line"></div>
        <p class="right">Subtotal: Rs ${receiptTxn.total_amount.toFixed(2)}</p>
        ${receiptTxn.calculatedDiscount > 0 ? `<p class="right">Discount: -Rs ${receiptTxn.calculatedDiscount.toFixed(2)}</p>` : ''}
        <p class="right total">Total: Rs ${receiptTxn.final_amount.toFixed(2)}</p>
        <p class="center" style="margin-top:12px;">Thank you for visiting!</p>
      </div>
    </div>
    <script>
      window.addEventListener('load', function () {
        setTimeout(function () {
          try { window.print(); } catch (e) {}
        }, 400);
      });
    </script>
    </body></html>`;
  };

  const handleSaveBillPdf = async () => {
    if (!window.api || !receiptTxn) return;
    try {
      const api = window.api as any;
      if (typeof api.saveBillPdf === 'function') {
        const result = await Promise.resolve(api.saveBillPdf(getBillDocumentHtml(), '48x1200'));
        if (result && result.success === false) {
          alert(`Save PDF failed: ${result.error || 'Unknown error'}`);
        }
        return;
      }
      if (typeof api.printReceipt === 'function') {
        api.printReceipt();
        return;
      }
      alert('PDF API missing. Please restart app.');
    } catch (error: any) {
      alert(`Save PDF failed: ${error?.message || 'Unknown error'}`);
    }
  };

  if (receiptTxn) {
    const leftMargin = receiptTxn.settings?.pos_margin_left || 0;
    
    return (
      <div style={{ padding: '24px', display: 'flex', gap: '24px', flexDirection: 'column', alignItems: 'center' }}>
        <div className="no-print" style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
           <button className="btn btn-primary" onClick={handlePrintBillPOS}><Printer size={16}/> Print Bill (POS)</button>
           <button className="btn btn-outline" onClick={handlePrintBillSystem}><Printer size={16}/> Print Bill (System)</button>
           <button className="btn btn-outline" onClick={handleSaveBillPdf}><Printer size={16}/> Save Bill PDF</button>
           <button className="btn btn-outline" onClick={() => setReceiptTxn(null)}>New Bill</button>
        </div>

        {/* Bill Receipt Area */}
        <div 
           id="bill-area"
           style={{ 
             background: '#fff', color: '#000', padding: '16px', borderRadius: '8px', 
             width: '300px', border: '1px solid #ddd'
           }}
        >
          <h2 style={{ textAlign: 'center', marginBottom: '4px', fontSize: '1.2rem' }}>{receiptTxn.settings?.clinic_name || 'Clinic'}</h2>
          <p style={{ textAlign: 'center', fontSize: '0.85rem', marginBottom: '12px' }}>{receiptTxn.settings?.clinic_address}</p>
          
          <div style={{ fontSize: '0.9rem', marginBottom: '12px' }}>
            <p><strong>Txn ID:</strong> #{receiptTxn.id}</p>
            <p><strong>Date:</strong> {new Date(receiptTxn.timestamp).toLocaleString()}</p>
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

        <style>{`
          @media print {
            body { background: white !important; color: black !important; margin: 0; padding: 0; }
            body * { visibility: hidden; }
            .no-print { display: none !important; }
            .layout * { display: none !important; }
            
            #bill-area, #bill-area * { visibility: visible; }
            #bill-area { 
              position: fixed !important; 
              left: 0 !important; 
              top: 0 !important; 
              margin: 0 !important;
              width: 48mm !important;
              max-width: 48mm !important;
              padding: 0 !important;
              padding-left: ${leftMargin}mm !important;
              border: none !important;
              font-size: 12px;
              box-sizing: border-box;
              overflow: hidden !important;
            }
            @page { size: 48mm 1200mm; margin: 0; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '24px', height: '100%' }}>
      
      {/* Left Column: Catalog */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-primary" onClick={addConsultation} style={{ flex: 1 }}>
            <Plus size={16} /> Consultation Fee
          </button>
          <button className="btn btn-outline" onClick={addCustomItem} style={{ flex: 1, borderStyle: 'dashed' }}>
             Custom Item
          </button>
        </div>

        <div className="card" style={{ flex: 1, overflowY: 'auto' }}>
          {Object.entries(treatmentGroups).map(([cat, items]) => (
            <div key={cat} style={{ marginBottom: '16px' }}>
              <h3 style={{ marginBottom: '12px', fontSize: '1rem', color: 'var(--text-muted)' }}>{cat}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {items.map(t => (
                  <button key={t.id} onClick={() => addCatalogItem(t)} style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-color)', color: 'var(--text-main)', textAlign: 'left', transition: '0.2s', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.borderColor = 'var(--primary-color)'} onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border-color)'}>
                    <div style={{ fontWeight: 500, marginBottom: '4px' }}>{t.name}</div>
                    <div style={{ color: 'var(--primary-color)' }}>₹{t.price}</div>
                  </button>
                ))}
              </div>
            </div>
          ))}

          <h3 style={{ margin: '24px 0 12px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>Medicines</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {medicines.map(m => (
              <button key={m.id} onClick={() => addCatalogItem(m)} style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-color)', color: 'var(--text-main)', textAlign: 'left', transition: '0.2s', cursor: 'pointer'}} onMouseOver={e => e.currentTarget.style.borderColor = 'var(--primary-color)'} onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border-color)'}>
                <div style={{ fontWeight: 500, marginBottom: '4px' }}>{m.name}</div>
                <div style={{ color: 'var(--primary-color)' }}>₹{m.price}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Section */}
      <div className="card" style={{ width: '400px', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <ShoppingCart size={20} /> Current Bill
        </h2>

        <div style={{ flex: 1, overflowY: 'auto', borderBottom: '1px solid var(--border-color)', marginBottom: '16px', paddingRight: '8px' }}>
          {cart.length === 0 ? <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '20px' }}>Cart is empty</p> : null}
          {cart.map((item, index) => (
            <div key={item.id || index} style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', background: 'var(--bg-color)', borderRadius: '8px', marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600 }}>{item.item_name}</span>
                <button className="btn-danger" style={{ padding: '4px' }} onClick={() => removeCartItem(index)}>
                  <Trash2 size={16} />
                </button>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Qty:</span>
                  <input type="number" min="1" value={item.quantity} onChange={(e) => updateItemQty(index, parseInt(e.target.value) || 1)} style={{ width: '50px', padding: '4px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--surface-color)', color: 'var(--text-main)' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>₹</span>
                  <input type="number" value={item.unit_price} onChange={(e) => updateItemPrice(index, parseFloat(e.target.value) || 0)} disabled={!settings?.allow_price_override} style={{ width: '70px', padding: '4px', borderRadius: '4px', border: '1px solid var(--border-color)', background: settings?.allow_price_override ? 'var(--surface-color)' : 'var(--bg-color)', color: 'var(--text-main)', opacity: settings?.allow_price_override ? 1 : 0.7 }} />
                </div>
                <span style={{ marginLeft: 'auto', fontWeight: 'bold' }}>₹{item.total_price.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>

          {settings?.allow_discount === 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
              <Tag size={16} color="var(--text-muted)" />
              <select value={discountType} onChange={(e) => setDiscountType(e.target.value as any)} style={{ padding: '4px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-main)' }}>
                <option value="flat">₹ Flat</option>
                <option value="percentage">% Percent</option>
              </select>
              <input type="number" value={discountValue} onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)} style={{ width: '80px', padding: '4px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-main)' }} />
              <span style={{ marginLeft: 'auto', color: 'var(--danger-color)' }}>-₹{calculatedDiscount.toFixed(2)}</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.4rem', fontWeight: 'bold', marginTop: '12px', borderTop: '2px dashed var(--border-color)', paddingTop: '12px' }}>
            <span>Total</span>
            <span style={{ color: 'var(--primary-color)' }}>₹{finalAmount.toFixed(2)}</span>
          </div>
        </div>

        <button className="btn btn-primary" style={{ justifyContent: 'center', padding: '16px', fontSize: '1.1rem' }} onClick={handleCheckout} disabled={cart.length === 0}>
          Proceed to Payment <IndianRupee size={20} />
        </button>
      </div>

      {/* Payment Modal Overlay */}
      {showPaymentModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
          <div className="card" style={{ width: '400px', animation: 'scaleUp 0.2s' }}>
            <h2 style={{ marginBottom: '24px' }}>Confirm Payment</h2>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', marginBottom: '24px', padding: '16px', background: 'var(--bg-color)', borderRadius: '8px' }}>
              <span>Total Payable:</span>
              <span style={{ fontWeight: 'bold' }}>₹{finalAmount.toFixed(2)}</span>
            </div>

            <div className="input-group">
              <label>Payment Mode</label>
              <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)} style={{ padding: '12px', fontSize: '1rem' }}>
                <option value="Cash">Cash</option>
                <option value="UPI">UPI / QR Code</option>
                <option value="Card">Credit/Debit Card</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
              <button className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowPaymentModal(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', background: 'var(--success-color)' }} onClick={processPayment}>Mark Paid</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
