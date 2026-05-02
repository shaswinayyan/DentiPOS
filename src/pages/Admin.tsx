import { useEffect, useState } from 'react';
import { Settings as SettingsType, CatalogItem } from '../types';
import { Plus, Trash2, Save, X, Edit } from 'lucide-react';

export default function Admin() {
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [treatments, setTreatments] = useState<CatalogItem[]>([]);
  const [medicines, setMedicines] = useState<CatalogItem[]>([]);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'treatment' | 'medicine'>('treatment');
  const [newItemParams, setNewItemParams] = useState<{id?: number, name: string, price: number, category: string}>({ name: '', price: 0, category: 'Basic Procedures' });

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

  const handleSaveSettings = async () => {
    if (settings && window.api) {
      await window.api.saveSettings(settings);
      alert('Settings saved!');
    }
  };

  const openAddItemModal = (type: 'treatment' | 'medicine') => {
    setModalType(type);
    setNewItemParams({ name: '', price: 0, category: 'Basic Procedures' });
    setShowModal(true);
  };

  const openEditItemModal = (item: CatalogItem, type: 'treatment' | 'medicine') => {
    setModalType(type);
    setNewItemParams({ id: item.id, name: item.name, price: item.price, category: item.category || 'Basic Procedures' });
    setShowModal(true);
  };

  const saveModalItem = async () => {
    if (!newItemParams.name || isNaN(newItemParams.price) || newItemParams.price < 0) {
      alert("Please enter valid name and a positive price.");
      return;
    }
    if (window.api) {
      await window.api.saveCatalogItem({ 
        id: newItemParams.id,
        name: newItemParams.name, 
        price: newItemParams.price, 
        type: modalType,
        category: modalType === 'treatment' ? newItemParams.category : undefined
      });
      setShowModal(false);
      loadData();
    }
  };

  const deleteItem = async (id: number, type: 'treatment' | 'medicine') => {
    if (window.confirm('Delete item?')) {
      if (window.api) {
        await window.api.deleteCatalogItem(id, type);
        loadData();
      }
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: '24px', fontSize: '1.8rem' }}>Admin / Settings</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Settings Card */}
        <div className="card">
          <h2 style={{ marginBottom: '16px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Save size={20} /> Clinic Settings
          </h2>
          {settings && (
            <div>
              <div className="input-group">
                <label>Clinic Name</label>
                <input value={settings.clinic_name} onChange={e => setSettings({...settings, clinic_name: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Clinic Address</label>
                <input value={settings.clinic_address} onChange={e => setSettings({...settings, clinic_address: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Default Consultation Fee (₹)</label>
                <input type="number" value={settings.consultation_fee} onChange={e => setSettings({...settings, consultation_fee: parseFloat(e.target.value)})} />
              </div>
              <div className="input-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '12px' }}>
                <input type="checkbox" checked={!!settings.allow_price_override} onChange={e => setSettings({...settings, allow_price_override: e.target.checked ? 1 : 0})} style={{ width: 'auto' }} />
                <label>Allow Price Override in Billing</label>
              </div>
              <div className="input-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '12px' }}>
                <input type="checkbox" checked={!!settings.allow_discount} onChange={e => setSettings({...settings, allow_discount: e.target.checked ? 1 : 0})} style={{ width: 'auto' }} />
                <label>Allow Discounts</label>
              </div>
              <div className="input-group">
                <label>POS Printer Left Margin (mm)</label>
                <input type="number" value={settings.pos_margin_left || 0} onChange={e => setSettings({...settings, pos_margin_left: parseFloat(e.target.value) || 0})} />
              </div>
              <button className="btn btn-primary" onClick={handleSaveSettings} style={{ marginTop: '16px' }}>Save Settings</button>
            </div>
          )}
        </div>

        {/* Catalog Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.2rem' }}>Treatments</h2>
              <button className="btn btn-primary" style={{ padding: '6px 12px' }} onClick={() => openAddItemModal('treatment')}>
                <Plus size={16} /> Add
              </button>
            </div>
            {treatments.map(t => (
              <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
                <div>
                  <div style={{ fontWeight: 500 }}>{t.name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t.category || 'Uncategorized'}</div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, marginRight: '8px' }}>₹{t.price}</span>
                  <button className="btn-outline" style={{ padding: '4px', borderRadius: '4px', border: 'none', background: 'transparent' }} onClick={() => openEditItemModal(t, 'treatment')}>
                    <Edit size={16} />
                  </button>
                  <button className="btn-danger" style={{ padding: '4px', borderRadius: '4px' }} onClick={() => deleteItem(t.id, 'treatment')}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.2rem' }}>Medicines</h2>
              <button className="btn btn-primary" style={{ padding: '6px 12px' }} onClick={() => openAddItemModal('medicine')}>
                <Plus size={16} /> Add
              </button>
            </div>
            {medicines.map(m => (
              <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
                <span>{m.name}</span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, marginRight: '8px' }}>₹{m.price}</span>
                  <button className="btn-outline" style={{ padding: '4px', borderRadius: '4px', border: 'none', background: 'transparent' }} onClick={() => openEditItemModal(m, 'medicine')}>
                    <Edit size={16} />
                  </button>
                  <button className="btn-danger" style={{ padding: '4px', borderRadius: '4px' }} onClick={() => deleteItem(m.id, 'medicine')}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Add Item Modal Overlay */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '400px', animation: 'scaleUp 0.2s', position: 'relative' }}>
            <button style={{ position: 'absolute', top: '16px', right: '16px', color: 'var(--text-muted)' }} onClick={() => setShowModal(false)}>
              <X size={20} />
            </button>
            
            <h2 style={{ marginBottom: '24px' }}>{newItemParams.id ? 'Edit' : 'Add New'} {modalType === 'treatment' ? 'Treatment' : 'Medicine'}</h2>
            
            <div className="input-group">
              <label>Name</label>
              <input 
                type="text" 
                placeholder="Item name"
                value={newItemParams.name} 
                onChange={(e) => setNewItemParams({...newItemParams, name: e.target.value})} 
              />
            </div>
            
            <div className="input-group">
              <label>Price (₹)</label>
              <input 
                type="number" 
                min="0"
                value={newItemParams.price} 
                onChange={(e) => setNewItemParams({...newItemParams, price: parseFloat(e.target.value) || 0})} 
              />
            </div>

            {modalType === 'treatment' && (
              <div className="input-group">
                <label>Category</label>
                <select 
                  value={newItemParams.category} 
                  onChange={(e) => setNewItemParams({...newItemParams, category: e.target.value})}
                >
                  <option value="Basic Procedures">Basic Procedures</option>
                  <option value="Endodontic Procedures">Endodontic Procedures</option>
                  <option value="Restorative Procedures">Restorative Procedures</option>
                  <option value="Periodontal Procedures">Periodontal Procedures</option>
                  <option value="Cosmetic Procedures">Cosmetic Procedures</option>
                  <option value="Orthodontic Procedures">Orthodontic Procedures</option>
                  <option value="Prosthetic Procedures">Prosthetic Procedures</option>
                  <option value="Implant Procedures">Implant Procedures</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
              <button className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={saveModalItem}>Save Item</button>
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
