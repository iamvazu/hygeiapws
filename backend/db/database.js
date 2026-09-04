/**
 * HYGEIA ENTERPRISE — DATABASE CONNECTION & SCHEMA MANAGER
 * SQLite embedded database engine with seamless PostgreSQL/MySQL compatibility for Hostinger VPS.
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { hashPassword } = require('../utils/auth');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'hygeia.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error connecting to SQLite database:', err.message);
  } else {
    console.log('✅ Connected to Hygeia SQLite Database at:', dbPath);
  }
});

// Helper for promise-based queries
db.runAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

db.allAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

db.getAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// Initialize Schemas & Seed Data
async function initDatabase() {
  // 1. Leads Table
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_unit TEXT NOT NULL, -- 'pws' | 'janitorial'
      customer_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      company_name TEXT,
      service_type TEXT NOT NULL,
      frequency TEXT,
      square_footage TEXT,
      address TEXT,
      city TEXT,
      estimated_value REAL DEFAULT 0,
      status TEXT DEFAULT 'new', -- 'new', 'quoted', 'dispatched', 'completed', 'cancelled'
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 2. Clients / Users Table
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_unit TEXT NOT NULL DEFAULT 'janitorial', -- 'janitorial' | 'pws' | 'enterprise'
      customer_id TEXT UNIQUE NOT NULL, -- e.g. 'HYG-C-1049'
      name TEXT NOT NULL,
      company_name TEXT,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password_hash TEXT,
      salt TEXT,
      role TEXT DEFAULT 'client', -- 'client' | 'admin'
      facility_address TEXT,
      city TEXT,
      active_plan TEXT NOT NULL DEFAULT 'Standard Facility Care Plan',
      monthly_rate REAL NOT NULL DEFAULT 0,
      next_service_date TEXT DEFAULT 'Pending Schedule',
      payment_method TEXT DEFAULT 'Visa ending in 4242',
      status TEXT DEFAULT 'active', -- 'active', 'paused', 'delinquent'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Auto-migrate clients columns if table existed without auth columns
  try {
    const tableInfo = await db.allAsync(`PRAGMA table_info(clients)`);
    const colNames = tableInfo.map(c => c.name);
    if (!colNames.includes('password_hash')) {
      await db.runAsync(`ALTER TABLE clients ADD COLUMN password_hash TEXT`);
    }
    if (!colNames.includes('salt')) {
      await db.runAsync(`ALTER TABLE clients ADD COLUMN salt TEXT`);
    }
    if (!colNames.includes('role')) {
      await db.runAsync(`ALTER TABLE clients ADD COLUMN role TEXT DEFAULT 'client'`);
    }
  } catch (e) {
    console.log('Column check notice:', e.message);
  }

  // 3. Work Orders / Extra Services Table
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS work_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER,
      client_name TEXT NOT NULL,
      service_name TEXT NOT NULL,
      scope_description TEXT,
      requested_date TEXT,
      urgency TEXT DEFAULT 'standard', -- 'standard', 'rush', 'emergency'
      price REAL DEFAULT 0,
      status TEXT DEFAULT 'pending_approval', -- 'pending_approval', 'approved', 'dispatched', 'completed'
      crew_assigned TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(client_id) REFERENCES clients(id)
    )
  `);

  // 4. Route Stops Table (Power Wash Truck Routes)
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS route_stops (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      truck_unit TEXT NOT NULL, -- e.g. 'Rig-01'
      driver_name TEXT NOT NULL,
      stop_order INTEGER NOT NULL,
      client_name TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      bins_count INTEGER DEFAULT 2,
      service_window TEXT,
      status TEXT DEFAULT 'pending', -- 'pending', 'en_route', 'completed', 'skipped'
      completed_at DATETIME
    )
  `);

  // 5. Invoices Table
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_number TEXT UNIQUE NOT NULL, -- e.g. 'INV-2026-089'
      client_id INTEGER,
      client_name TEXT NOT NULL,
      amount REAL NOT NULL,
      issue_date TEXT,
      due_date TEXT,
      status TEXT DEFAULT 'pending', -- 'paid', 'pending', 'overdue'
      line_items_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(client_id) REFERENCES clients(id)
    )
  `);

  // 6. Admin Users Table
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      role TEXT DEFAULT 'superadmin',
      last_login DATETIME
    )
  `);

  // Auto-migrate admin_users columns if table existed without salt
  try {
    const adminTableInfo = await db.allAsync(`PRAGMA table_info(admin_users)`);
    const adminColNames = adminTableInfo.map(c => c.name);
    if (!adminColNames.includes('salt')) {
      await db.runAsync(`ALTER TABLE admin_users ADD COLUMN salt TEXT`);
    }
  } catch (e) {
    console.log('Admin column check notice:', e.message);
  }

  // Seed default demo data if tables are empty
  const clientCount = await db.getAsync(`SELECT COUNT(*) as count FROM clients`);
  const defaultPw = hashPassword('Hygeia2026!');
  const adminPw = hashPassword('HygeiaAdmin2026!');

  // Ensure Admin user exists
  const adminExists = await db.getAsync(`SELECT id FROM admin_users WHERE username = 'admin@hygeia.com'`);
  if (!adminExists) {
    await db.runAsync(
      `INSERT INTO admin_users (username, password_hash, salt, role) VALUES (?, ?, ?, ?)`,
      ['admin@hygeia.com', adminPw.hash, adminPw.salt, 'superadmin']
    );
    console.log('✅ Default superadmin created: admin@hygeia.com / HygeiaAdmin2026!');
  }

  // Ensure Seed Clients have password hashes
  if (clientCount.count === 0) {
    console.log('🌱 Seeding initial database records for Montero Enterprises...');
    
    // Seed Clients with secure password hash
    await db.runAsync(`
      INSERT INTO clients (business_unit, customer_id, name, company_name, email, phone, password_hash, salt, role, facility_address, city, active_plan, monthly_rate, next_service_date) VALUES
      ('pws', 'HYG-PWS-1049', 'Johnathan Miller', 'Miller Tech Residences', 'client@hygeiapws.com', '(650) 933-3823', ?, ?, 'client', '4820 Innovation Way, Suite 100', 'Santa Clara', 'Commercial Bin & Walkway Pro ($249/mo)', 249.00, 'Tomorrow, 7:30 AM'),
      ('janitorial', 'HYG-JS-2088', 'Dr. Amanda Thorne', 'Valley Surgical Center', 'client@valleyhealth.org', '(408) 555-8822', ?, ?, 'client', '1200 BioWay Blvd', 'San Jose', 'Medical Terminal Sanitization & Day Porter ($4,200/mo)', 4200.00, 'Tonight, 9:00 PM')
    `, [defaultPw.hash, defaultPw.salt, defaultPw.hash, defaultPw.salt]);

    // Seed Work Orders
    await db.runAsync(`
      INSERT INTO work_orders (client_id, client_name, service_name, scope_description, requested_date, urgency, price, status, crew_assigned) VALUES
      (1, 'Miller Tech Residences', 'Post-Event High-Pressure Grease Remediation', 'Dumpster pad degreasing and loading dock hot-water wash', '2026-09-08', 'standard', 380.00, 'approved', 'Truck Unit Rig-01 (Carlos M.)'),
      (2, 'Valley Surgical Center', 'Emergency ISO-7 Cleanroom Decontamination', 'Spill remediation and cleanroom wall wiping', '2026-09-05', 'emergency', 1200.00, 'dispatched', 'Team Alpha (Hector S.)')
    `);

    // Seed Invoices
    await db.runAsync(`
      INSERT INTO invoices (invoice_number, client_id, client_name, amount, issue_date, due_date, status) VALUES
      ('INV-2026-089', 1, 'Miller Tech Residences', 249.00, 'Sep 01, 2026', 'Sep 15, 2026', 'paid'),
      ('INV-2026-088', 1, 'Miller Tech Residences', 249.00, 'Aug 01, 2026', 'Aug 15, 2026', 'paid'),
      ('INV-2026-090', 2, 'Valley Surgical Center', 4200.00, 'Sep 01, 2026', 'Sep 15, 2026', 'paid')
    `);

    console.log('✅ Initial client seed accounts populated!');
  } else {
    // Ensure Seed Clients have password hashes
    const unhashedClients = await db.allAsync(`SELECT id FROM clients WHERE password_hash IS NULL`);
    for (const c of unhashedClients) {
      await db.runAsync(`UPDATE clients SET password_hash = ?, salt = ? WHERE id = ?`, [defaultPw.hash, defaultPw.salt, c.id]);
    }

    // Ensure Janitorial demo client exists
    const janDemo = await db.getAsync(`SELECT id FROM clients WHERE email = 'client@valleyhealth.org'`);
    if (!janDemo) {
      await db.runAsync(`
        INSERT INTO clients (business_unit, customer_id, name, company_name, email, phone, password_hash, salt, role, facility_address, city, active_plan, monthly_rate, next_service_date) VALUES
        ('janitorial', 'HYG-JS-3011', 'Dr. Amanda Thorne', 'Valley Surgical Center', 'client@valleyhealth.org', '(408) 555-8822', ?, ?, 'client', '1200 BioWay Blvd', 'San Jose', 'Medical Terminal Sanitization & Day Porter ($4,200/mo)', 4200.00, 'Tonight, 9:00 PM')
      `, [defaultPw.hash, defaultPw.salt]);
      console.log('✅ Default janitorial client created: client@valleyhealth.org / Hygeia2026!');
    }
  }
}

module.exports = {
  db,
  initDatabase
};
