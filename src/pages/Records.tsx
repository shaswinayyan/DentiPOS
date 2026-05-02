import { useEffect, useState } from 'react';
import { ClinicalRecord } from '../types';
import { FileText, Printer, Search, Eye } from 'lucide-react';

export default function Records() {
  const [records, setRecords] = useState<ClinicalRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    if (window.api) {
      setRecords(await window.api.getClinicalRecords());
    }
  };

  const viewRecord = async (id: number) => {
    if (window.api) {
      const details = await window.api.getClinicalRecordDetails(id);
      const settings = await window.api.getSettings();
      setSelectedRecord({
        ...details.record,
        prescriptions: details.prescriptions,
        settings
      });
    }
  };

  const handlePrint = () => {
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleSavePDF = () => {
    if (window.api) window.api.printReceipt();
  };

  const filteredRecords = records.filter(r => 
    r.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.patient_phone.includes(searchTerm) ||
    (r.op_id && r.op_id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (selectedRecord) {
    return (
      <div style={{ padding: '24px', display: 'flex', gap: '24px', flexDirection: 'column', alignItems: 'center' }}>
        <div className="no-print" style={{ display: 'flex', gap: '16px', marginBottom: '16px', width: '800px', justifyContent: 'flex-start' }}>
           <button className="btn btn-outline" onClick={() => setSelectedRecord(null)}>Back to Records</button>
           <button className="btn btn-primary" onClick={handlePrint}><Printer size={16}/> Print Prescription (A4)</button>
           <button className="btn btn-outline" onClick={handleSavePDF}><Printer size={16}/> Save as PDF</button>
        </div>

        <div 
           id="rx-area"
           style={{ 
             background: '#fff', color: '#000', padding: '40px', borderRadius: '8px', 
             width: '800px', border: '1px solid #ddd',
           }}
        >
          <h2 style={{ textAlign: 'center', marginBottom: '8px', fontSize: '1.5rem', color: '#2c3e50' }}>{selectedRecord.settings?.clinic_name || 'Clinic'}</h2>
          <p style={{ textAlign: 'center', fontSize: '1rem', marginBottom: '24px', color: '#7f8c8d' }}>{selectedRecord.settings?.clinic_address}</p>
          
          <h3 style={{ borderBottom: '2px solid #3498db', paddingBottom: '8px', marginBottom: '20px' }}>Prescription & Clinical Summary</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div>
              <p><strong>Patient Name:</strong> {selectedRecord.patient_name || 'N/A'}</p>
              {selectedRecord.op_id && <p><strong>OP ID:</strong> {selectedRecord.op_id}</p>}
              <p><strong>Phone:</strong> {selectedRecord.patient_phone || 'N/A'}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p><strong>Date:</strong> {new Date(selectedRecord.timestamp).toLocaleDateString()}</p>
              <p><strong>Record ID:</strong> #{selectedRecord.id}</p>
            </div>
          </div>

          {selectedRecord.chief_complaint && (
            <div style={{ marginBottom: '24px' }}>
              <strong>Chief Complaint:</strong>
              <p style={{ marginTop: '4px', whiteSpace: 'pre-wrap' }}>{selectedRecord.chief_complaint}</p>
            </div>
          )}

          {selectedRecord.prescriptions?.length > 0 && (
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
                {selectedRecord.prescriptions.map((rx: any, i: number) => (
                  <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{rx.medication_name}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>{rx.dosage_morning} - {rx.dosage_afternoon} - {rx.dosage_night}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>{rx.timing}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>{rx.duration_days} Days</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div style={{ marginTop: '60px', textAlign: 'right' }}>
            <p>_______________________</p>
            <p style={{ marginTop: '8px' }}>{selectedRecord.doctor_name || "Doctor's Signature"}</p>
          </div>
        </div>

        <style>{`
          @media print {
            body { background: white !important; color: black !important; margin: 0; padding: 0; }
            body * { visibility: hidden; }
            .no-print { display: none !important; }
            
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
          }
        `}</style>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ marginBottom: '24px', fontSize: '1.8rem' }}>Patient Records</h1>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} /> Clinical & Prescription History
          </h2>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search patient..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)}
              style={{ padding: '8px 12px 8px 32px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-main)' }}
            />
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
              <th style={{ padding: '12px 0', color: 'var(--text-muted)' }}>Date & Time</th>
              <th style={{ padding: '12px 0', color: 'var(--text-muted)' }}>OP ID</th>
              <th style={{ padding: '12px 0', color: 'var(--text-muted)' }}>Patient Name</th>
              <th style={{ padding: '12px 0', color: 'var(--text-muted)' }}>Phone</th>
              <th style={{ padding: '12px 0', color: 'var(--text-muted)' }}>Doctor</th>
              <th style={{ padding: '12px 0', color: 'var(--text-muted)' }}>Complaint</th>
              <th style={{ padding: '12px 0', color: 'var(--text-muted)' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map(r => (
              <tr key={r.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '12px 0' }}>{new Date(r.timestamp).toLocaleString()}</td>
                <td style={{ padding: '12px 0', fontWeight: 500 }}>{r.op_id || '-'}</td>
                <td style={{ padding: '12px 0', fontWeight: 500 }}>{r.patient_name || '-'}</td>
                <td style={{ padding: '12px 0' }}>{r.patient_phone || '-'}</td>
                <td style={{ padding: '12px 0' }}>{r.doctor_name || '-'}</td>
                <td style={{ padding: '12px 0' }}>
                  <div style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {r.chief_complaint || '-'}
                  </div>
                </td>
                <td style={{ padding: '12px 0' }}>
                  <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.9rem' }} onClick={() => viewRecord(r.id!)}>
                    <Eye size={16} /> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredRecords.length === 0 && (
          <p style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No records found.</p>
        )}
      </div>

    </div>
  );
}
