import Database from 'better-sqlite3';

export function setupDatabase(dbPath: string) {
  const db = new Database(dbPath, { verbose: console.log });
  db.pragma('journal_mode = WAL');

  // Initialization
  db.exec(`
    CREATE TABLE IF NOT EXISTS Transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT, 
      timestamp TEXT, 
      total_amount REAL, 
      discount_amount REAL, 
      final_amount REAL
    );
    CREATE TABLE IF NOT EXISTS Transaction_Items (
      id INTEGER PRIMARY KEY AUTOINCREMENT, 
      transaction_id INTEGER, 
      item_name TEXT, 
      category TEXT, 
      quantity INTEGER, 
      unit_price REAL, 
      total_price REAL
    );
    CREATE TABLE IF NOT EXISTS Payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT, 
      transaction_id INTEGER, 
      payment_mode TEXT, 
      amount REAL
    );
    CREATE TABLE IF NOT EXISTS Discounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT, 
      transaction_id INTEGER, 
      type TEXT, 
      value REAL
    );
    CREATE TABLE IF NOT EXISTS Treatment_Master (
      id INTEGER PRIMARY KEY AUTOINCREMENT, 
      name TEXT, 
      price REAL,
      category TEXT DEFAULT 'Uncategorized'
    );
    CREATE TABLE IF NOT EXISTS Medicine_Master (
      id INTEGER PRIMARY KEY AUTOINCREMENT, 
      name TEXT, 
      price REAL
    );
    CREATE TABLE IF NOT EXISTS Settings (
      id INTEGER PRIMARY KEY DEFAULT 1, 
      consultation_fee REAL, 
      gst_enabled INTEGER, 
      allow_price_override INTEGER, 
      allow_discount INTEGER, 
      clinic_name TEXT, 
      clinic_address TEXT
    );
  `);

  try {
    db.prepare('ALTER TABLE Treatment_Master ADD COLUMN category TEXT DEFAULT "Uncategorized"').run();
  } catch (e) {
    // Column already exists
  }

  // Default initial data
  const checkSettings = db.prepare(`SELECT COUNT(*) as count FROM Settings`).get() as { count: number };
  if (checkSettings.count === 0) {
    db.prepare(`
      INSERT INTO Settings (id, consultation_fee, gst_enabled, allow_price_override, allow_discount, clinic_name, clinic_address) 
      VALUES (1, 250, 0, 1, 1, 'My Dental Clinic', '123 Health Street')
    `).run();
  }

  const checkTreatments = db.prepare(`SELECT COUNT(*) as count FROM Treatment_Master`).get() as { count: number };
  if (checkTreatments.count === 0) {
    const insertTreatment = db.prepare(`INSERT INTO Treatment_Master (name, price, category) VALUES (?, ?, ?)`);
    // Basic Procedures
    insertTreatment.run('Consultation', 250, 'Basic Procedures');
    insertTreatment.run('Dental X-Ray', 250, 'Basic Procedures');
    insertTreatment.run('Extraction (Mild)', 600, 'Basic Procedures');
    insertTreatment.run('Extraction (Moderate)', 1000, 'Basic Procedures');
    insertTreatment.run('Extraction (Severe)', 1500, 'Basic Procedures');
    insertTreatment.run('Wisdom Tooth (Non Surgical)', 2000, 'Basic Procedures');
    insertTreatment.run('Wisdom Tooth (Surgical)', 5000, 'Basic Procedures');
    insertTreatment.run('Minor Surgical Procedure', 1500, 'Basic Procedures');
    insertTreatment.run('Bone Grafts', 3000, 'Basic Procedures');
    
    // Orthodontic Procedures
    insertTreatment.run('Metal (Basic)', 18000, 'Orthodontic Procedures');
    insertTreatment.run('Metal (Standard)', 24000, 'Orthodontic Procedures');
    insertTreatment.run('Metal (Premium)', 45000, 'Orthodontic Procedures');
    insertTreatment.run('Ceramic (Basic)', 30000, 'Orthodontic Procedures');
    insertTreatment.run('Ceramic (Standard)', 45000, 'Orthodontic Procedures');
    insertTreatment.run('Ceramic (Premium)', 60000, 'Orthodontic Procedures');
    insertTreatment.run('Lingual', 80000, 'Orthodontic Procedures');
    insertTreatment.run('Aligners (Basic)', 60000, 'Orthodontic Procedures');
    insertTreatment.run('Aligners (Standard)', 90000, 'Orthodontic Procedures');

    // Endodontic Procedures
    insertTreatment.run('Root Canal (Basic)', 3000, 'Endodontic Procedures');
    insertTreatment.run('Root Canal (Standard)', 5000, 'Endodontic Procedures');
    insertTreatment.run('Root Canal (Lasers)', 8000, 'Endodontic Procedures');
    insertTreatment.run('Pulpectomy (Kids)', 4000, 'Endodontic Procedures');
    insertTreatment.run('Indirect Pulp Capping', 3000, 'Endodontic Procedures');
    
    // Restorative Procedures
    insertTreatment.run('GIC Restoration', 700, 'Restorative Procedures');
    insertTreatment.run('Composite Restoration', 1000, 'Restorative Procedures');
    insertTreatment.run('Silver Restoration', 1500, 'Restorative Procedures');
    insertTreatment.run('Teeth Bleaching', 10000, 'Restorative Procedures');
    insertTreatment.run('Dental Jewelry', 2000, 'Restorative Procedures');
    
    // Periodontal Procedures
    insertTreatment.run('Root Planning (Basic)', 2500, 'Periodontal Procedures');
    insertTreatment.run('Root Planning (Std)', 4000, 'Periodontal Procedures');
    insertTreatment.run('Gum Therapy (Basic)', 4000, 'Periodontal Procedures');
    insertTreatment.run('Gum Therapy (Lasers)', 7000, 'Periodontal Procedures');
    insertTreatment.run('Bone Grafts (Perio)', 3000, 'Periodontal Procedures');

    // Prosthetic Procedures
    insertTreatment.run('Ceramic With Metal (Tempo)', 3000, 'Prosthetic Procedures');
    insertTreatment.run('Ceramic With Metal (Basic)', 4000, 'Prosthetic Procedures');
    insertTreatment.run('Ceramic With Metal (Std)', 5500, 'Prosthetic Procedures');
    insertTreatment.run('Ceramic With Metal (Prem)', 7000, 'Prosthetic Procedures');
    insertTreatment.run('Zirconia (Basic)', 9000, 'Prosthetic Procedures');
    insertTreatment.run('Zirconia (Std)', 13000, 'Prosthetic Procedures');
    insertTreatment.run('Zirconia (Prem)', 18000, 'Prosthetic Procedures');
    insertTreatment.run('Dentures (Basic)', 20000, 'Prosthetic Procedures');
    insertTreatment.run('Dentures (Std)', 30000, 'Prosthetic Procedures');
    insertTreatment.run('Dentures (Prem)', 45000, 'Prosthetic Procedures');
    insertTreatment.run('Implant Denture (Acrylic)', 50000, 'Prosthetic Procedures');
    insertTreatment.run('Implant Denture (Hybrid)', 90000, 'Prosthetic Procedures');

    // Implant Procedures
    insertTreatment.run('Implant (Redice/Adin)', 18000, 'Implant Procedures');
    insertTreatment.run('Implant (MIS/Noris)', 28000, 'Implant Procedures');
    insertTreatment.run('Implant (Noble/Alpha)', 48000, 'Implant Procedures');
    insertTreatment.run('Full Mouth (Basic)', 300000, 'Implant Procedures');
    insertTreatment.run('Full Mouth (Premium)', 500000, 'Implant Procedures');
  }

  return {
    getSettings: () => {
      return db.prepare('SELECT * FROM Settings WHERE id = 1').get();
    },
    saveSettings: (settings: any) => {
      const stmt = db.prepare(`
        UPDATE Settings SET 
          consultation_fee = ?, gst_enabled = ?, allow_price_override = ?, 
          allow_discount = ?, clinic_name = ?, clinic_address = ?
        WHERE id = 1
      `);
      stmt.run(
        settings.consultation_fee, settings.gst_enabled, settings.allow_price_override, 
        settings.allow_discount, settings.clinic_name, settings.clinic_address
      );
      return true;
    },
    getCatalog: (type: 'treatment' | 'medicine') => {
      const table = type === 'treatment' ? 'Treatment_Master' : 'Medicine_Master';
      return db.prepare(`SELECT *, '${type}' as type FROM ${table}`).all();
    },
    saveCatalogItem: (item: any) => {
      const table = item.type === 'treatment' ? 'Treatment_Master' : 'Medicine_Master';
      if (item.type === 'treatment') {
        if (item.id) {
          db.prepare(`UPDATE Treatment_Master SET name = ?, price = ?, category = ? WHERE id = ?`).run(item.name, item.price, item.category || 'Uncategorized', item.id);
        } else {
          db.prepare(`INSERT INTO Treatment_Master (name, price, category) VALUES (?, ?, ?)`).run(item.name, item.price, item.category || 'Uncategorized');
        }
      } else {
        if (item.id) {
          db.prepare(`UPDATE ${table} SET name = ?, price = ? WHERE id = ?`).run(item.name, item.price, item.id);
        } else {
          db.prepare(`INSERT INTO ${table} (name, price) VALUES (?, ?)`).run(item.name, item.price);
        }
      }
      return true;
    },
    deleteCatalogItem: (id: number, type: 'treatment' | 'medicine') => {
      const table = type === 'treatment' ? 'Treatment_Master' : 'Medicine_Master';
      db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(id);
      return true;
    },
    saveTransaction: (txn: any, items: any[], payments: any[], discounts: any[]) => {
      const transactionObj = db.transaction(() => {
        const stmt = db.prepare(`INSERT INTO Transactions (timestamp, total_amount, discount_amount, final_amount) VALUES (?, ?, ?, ?)`);
        const info = stmt.run(txn.timestamp, txn.total_amount, txn.discount_amount, txn.final_amount);
        const txnId = info.lastInsertRowid;

        const itemStmt = db.prepare(`INSERT INTO Transaction_Items (transaction_id, item_name, category, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?, ?)`);
        for (const item of items) {
          itemStmt.run(txnId, item.item_name, item.category, item.quantity, item.unit_price, item.total_price);
        }

        const paymentStmt = db.prepare(`INSERT INTO Payments (transaction_id, payment_mode, amount) VALUES (?, ?, ?)`);
        for (const pay of payments) {
          paymentStmt.run(txnId, pay.payment_mode, pay.amount);
        }

        const discountStmt = db.prepare(`INSERT INTO Discounts (transaction_id, type, value) VALUES (?, ?, ?)`);
        for (const d of discounts) {
          discountStmt.run(txnId, d.type, d.value);
        }

        return txnId;
      });

      try {
        const txnId = transactionObj();
        return { success: true, transactionId: txnId };
      } catch (err) {
        console.error("DB Error: ", err);
        return { success: false };
      }
    },
    getTransactions: () => {
      return db.prepare('SELECT * FROM Transactions ORDER BY timestamp DESC').all();
    },
    getTransactionDetails: (id: number) => {
      const transaction = db.prepare('SELECT * FROM Transactions WHERE id = ?').get(id);
      const items = db.prepare('SELECT * FROM Transaction_Items WHERE transaction_id = ?').all(id);
      const payments = db.prepare('SELECT * FROM Payments WHERE transaction_id = ?').all(id);
      const discounts = db.prepare('SELECT * FROM Discounts WHERE transaction_id = ?').all(id);
      return { transaction, items, payments, discounts };
    }
  };
}
