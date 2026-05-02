import { useState, useEffect } from 'react';
import { CatalogItem, Settings as SettingsType, Doctor } from '../types';
import { Plus, Printer, Trash2, User, Pill, CheckCircle } from 'lucide-react';

type PRow = { medication_name: string; dosage_morning: number; dosage_afternoon: number; dosage_night: number; timing: 'Before Food' | 'After Food'; duration_days: number; };
const PRESETS: Record<string, [number, number, number]> = { '1-0-1': [1,0,1], '1-1-1': [1,1,1], '0-0-1': [0,0,1], '1-0-0': [1,0,0] };

export default function Clinical() {
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [medicines, setMedicines] = useState<CatalogItem[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  
  // Clinical States
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [opId, setOpId] = useState('');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [rxRows, setRxRows] = useState<PRow[]>([]);
  
  // Print Mode & Success State
  const [savedRecord, setSavedRecord] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (window.api) {
      setSettings(await window.api.getSettings());
      setMedicines(await window.api.getCatalog('medicine'));
      const docs = await window.api.getDoctors();
      setDoctors(docs);
      if (docs.length > 0) setSelectedDoctor(docs[0].name);
    }
  };

  const newRxRow = (): PRow => ({ medication_name: '', dosage_morning: 1, dosage_afternoon: 0, dosage_night: 1, timing: 'After Food', duration_days: 5 });
  const addRxRow = () => setRxRows([...rxRows, newRxRow()]);
  const removeRxRow = (index: number) => {
    const r = [...rxRows]; r.splice(index, 1); setRxRows(r);
  };
  const updateRx = (index: number, field: keyof PRow, val: any) => {
    const r = [...rxRows]; r[index] = { ...r[index], [field]: val }; setRxRows(r);
  };
  const applyPreset = (index: number, presetStr: string) => {
    const [m, a, n] = PRESETS[presetStr];
    const r = [...rxRows];
    r[index].dosage_morning = m; r[index].dosage_afternoon = a; r[index].dosage_night = n;
    setRxRows(r);
  };

  const handleSaveAndPrint = async () => {
    if (!patientName.trim()) {
      alert("Patient Name is required to save a clinical record.");
      return;
    }

    if (!window.api) return;

    const record = {
      timestamp: new Date().toISOString(),
      patient_name: patientName,
      patient_phone: patientPhone,
      op_id: opId,
      chief_complaint: chiefComplaint,
      doctor_name: selectedDoctor
    };

    const res = await window.api.saveClinicalRecord(record, rxRows as any);

    if (res.success && res.clinicalRecordId) {
      setSavedRecord({
        ...record,
        id: res.clinicalRecordId,
        prescriptions: [...rxRows],
        settings
      });
      
      // Removed auto-print

      // Reset form
      setPatientName('');
      setPatientPhone('');
      setOpId('');
      setChiefComplaint('');
      setRxRows([]);
    } else {
      alert("Failed to save clinical record.");
    }
  };

  const handleManualPrint = () => {
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleSavePDF = () => {
    if (window.api) window.api.printReceipt();
  };

  if (savedRecord) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '24px' }}>
        <div className="card layout-success-screen" style={{ textAlign: 'center', padding: '48px', maxWidth: '500px' }}>
          <CheckCircle size={64} color="var(--success-color)" style={{ margin: '0 auto 16px' }} />
          <h2>Record Saved Successfully!</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px', marginBottom: '24px' }}>
            Patient: {savedRecord.patient_name} <br/>
            {savedRecord.op_id && <span>OP ID: {savedRecord.op_id} <br/></span>}
            Record ID: #{savedRecord.id}
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={handleManualPrint}><Printer size={16}/> Print Prescription</button>
            <button className="btn btn-outline" onClick={handleSavePDF}><Printer size={16}/> Save as PDF</button>
            <button className="btn btn-outline" onClick={() => setSavedRecord(null)}>Create New Record</button>
          </div>
        </div>

        <div id="rx-area" style={{ background: '#fff', color: '#000', padding: '40px', width: '100%', boxSizing: 'border-box' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '8px', fontSize: '1.5rem', color: '#2c3e50' }}>{savedRecord.settings?.clinic_name || 'Clinic'}</h2>
          <p style={{ textAlign: 'center', fontSize: '1rem', marginBottom: '24px', color: '#7f8c8d' }}>{savedRecord.settings?.clinic_address}</p>
          
          <h3 style={{ borderBottom: '2px solid #3498db', paddingBottom: '8px', marginBottom: '20px' }}>Prescription & Clinical Summary</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div>
              <p><strong>Patient Name:</strong> {savedRecord.patient_name || 'N/A'}</p>
              {savedRecord.op_id && <p><strong>OP ID:</strong> {savedRecord.op_id}</p>}
              <p><strong>Phone:</strong> {savedRecord.patient_phone || 'N/A'}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p><strong>Date:</strong> {new Date(savedRecord.timestamp).toLocaleDateString()}</p>
              <p><strong>Record ID:</strong> #{savedRecord.id}</p>
            </div>
          </div>

          {savedRecord.chief_complaint && (
            <div style={{ marginBottom: '24px' }}>
              <strong>Chief Complaint:</strong>
              <p style={{ marginTop: '4px', whiteSpace: 'pre-wrap' }}>{savedRecord.chief_complaint}</p>
            </div>
          )}

          {savedRecord.prescriptions?.length > 0 && (
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
                {savedRecord.prescriptions.map((rx: any, i: number) => (
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
            <p style={{ marginTop: '8px' }}>{savedRecord.doctor_name || "Doctor's Signature"}</p>
          </div>
        </div>

        <style>{`
          #rx-area {
            position: absolute;
            left: -99999px;
            top: 0;
            width: 800px;
          }
          @media print {
            body { background: white !important; color: black !important; margin: 0; padding: 0; }
            body * { visibility: hidden; }
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
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h1 style={{ fontSize: '1.8rem' }}>Clinical & Prescription</h1>

      <div className="card">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '1.2rem' }}>
          <User size={20} /> Patient Details
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Patient Name *</label>
            <input type="text" value={patientName} onChange={e => setPatientName(e.target.value)} placeholder="e.g. John Doe" />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>OP ID / Patient ID</label>
            <input type="text" value={opId} onChange={e => setOpId(e.target.value)} placeholder="e.g. OP-12345" />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Phone Number</label>
            <input type="text" value={patientPhone} onChange={e => setPatientPhone(e.target.value)} placeholder="e.g. 9876543210" />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Chief Complaint</label>
            <textarea 
              rows={3} 
              value={chiefComplaint} 
              onChange={e => setChiefComplaint(e.target.value)} 
              placeholder="e.g. Patient complains of pain in lower left molar..."
              style={{ padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-color)', color: 'var(--text-main)', resize: 'vertical' }}
            />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Doctor</label>
            <select value={selectedDoctor} onChange={e => setSelectedDoctor(e.target.value)} style={{ padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-color)', color: 'var(--text-main)' }}>
              {doctors.length === 0 && <option value="">No doctors available</option>}
              {doctors.map(d => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem' }}>
            <Pill size={20} /> Medicines
          </h2>
          <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.9rem' }} onClick={addRxRow}>
            <Plus size={16} /> Add Medicine
          </button>
        </div>
        
        {rxRows.length === 0 && (
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
            No medicines added. Click "Add Medicine" to prescribe.
          </div>
        )}

        {rxRows.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                  <th style={{ padding: '8px 4px', minWidth: '150px' }}>Medicine Name</th>
                  <th style={{ padding: '8px 4px' }}>Dosage (M-A-N)</th>
                  <th style={{ padding: '8px 4px' }}>Timing</th>
                  <th style={{ padding: '8px 4px' }}>Days</th>
                  <th style={{ padding: '8px 4px' }}></th>
                </tr>
              </thead>
              <tbody>
                {rxRows.map((rx, i) => (
                  <tr key={i} style={{ borderBottom: '1px dashed var(--border-color)' }}>
                    <td style={{ padding: '8px 4px' }}>
                      <select 
                        value={rx.medication_name} 
                        onChange={e => updateRx(i, 'medication_name', e.target.value)} 
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-main)' }} 
                      >
                        <option value="">Select Medicine...</option>
                        {medicines.map(m => (
                          <option key={m.id} value={m.name}>{m.name}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: '8px 4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input type="number" min="0" max="9" value={rx.dosage_morning} onChange={e => updateRx(i, 'dosage_morning', parseInt(e.target.value)||0)} style={{ width: '40px', padding: '6px', textAlign: 'center', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-main)' }} />
                        -
                        <input type="number" min="0" max="9" value={rx.dosage_afternoon} onChange={e => updateRx(i, 'dosage_afternoon', parseInt(e.target.value)||0)} style={{ width: '40px', padding: '6px', textAlign: 'center', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-main)' }} />
                        -
                        <input type="number" min="0" max="9" value={rx.dosage_night} onChange={e => updateRx(i, 'dosage_night', parseInt(e.target.value)||0)} style={{ width: '40px', padding: '6px', textAlign: 'center', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-main)' }} />
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginLeft: '8px' }}>
                           {Object.keys(PRESETS).map(p => (
                             <button key={p} onClick={() => applyPreset(i, p)} style={{ fontSize: '0.75rem', padding: '2px 6px', background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-main)' }}>{p}</button>
                           ))}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '8px 4px' }}>
                      <select value={rx.timing} onChange={e => updateRx(i, 'timing', e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-main)' }}>
                        <option value="Before Food">Before Food</option>
                        <option value="After Food">After Food</option>
                      </select>
                    </td>
                    <td style={{ padding: '8px 4px' }}>
                      <input type="number" min="1" value={rx.duration_days} onChange={e => updateRx(i, 'duration_days', parseInt(e.target.value)||1)} style={{ width: '60px', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-main)' }} />
                    </td>
                    <td style={{ padding: '8px 4px', textAlign: 'center' }}>
                      <button className="btn-danger" style={{ padding: '8px', borderRadius: '4px' }} onClick={() => removeRxRow(i)}><Trash2 size={16}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
        <button 
          className="btn btn-primary" 
          onClick={handleSaveAndPrint}
          style={{ padding: '16px 32px', fontSize: '1.1rem' }}
          disabled={!patientName.trim()}
        >
          <Printer size={20} /> Save & Print Record
        </button>
      </div>

    </div>
  );
}
