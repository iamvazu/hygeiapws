/**
 * HYGEIA ENTERPRISE — DATABASE CONNECTION & SCHEMA MANAGER
 * SQLite embedded database engine with seamless PostgreSQL/MySQL compatibility for Hostinger VPS.
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

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

  // 2. Clients Table
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_unit TEXT NOT NULL,
      customer_id TEXT UNIQUE NOT NULL, -- e.g. 'HYG-C-1049'
      name TEXT NOT NULL,
      company_name TEXT,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      facility_address TEXT,
      city TEXT,
      active_plan TEXT NOT NULL,
      monthly_rate REAL NOT NULL,
      next_service_date TEXT,
      payment_method TEXT DEFAULT 'Visa ending in 4242',
      status TEXT DEFAULT 'active', -- 'active', 'paused', 'delinquent'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

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
      role TEXT DEFAULT 'superadmin',
      last_login DATETIME
    )
  `);

  // Seed default demo data if tables are empty
  const leadCount = await db.getAsync(`SELECT COUNT(*) as count FROM leads`);
  if (leadCount.count === 0) {
    console.log('🌱 Seeding initial database records for Montero Enterprises...');
    
    // Seed Leads
    await db.runAsync(`
      INSERT INTO leads (business_unit, customer_name, email, phone, company_name, service_type, frequency, square_footage, city, estimated_value, status) VALUES
      ('janitorial', 'Marcus Vance', 'mvance@siliconcloud.io', '(408) 555-0192', 'Silicon Cloud HQ', 'Commercial Janitorial & Day Porter', '5 Days/Week', '45,000 sq ft', 'Santa Clara', 6800.00, 'quoted'),
      ('janitorial', 'Elena Rostova', 'erostova@medbay.com', '(650) 555-0811', 'BioMed Surgical Center', 'Terminal Medical Sanitization', '7 Days/Week', '18,500 sq ft', 'Palo Alto', 4200.00, 'dispatched'),
      ('pws', 'David Chen', 'dchen@santanarow.com', '(408) 555-9321', 'Santana Retail Plaza', 'Dumpster Pad & Sidewalk Washing', 'Bi-Weekly', '12,000 sq ft', 'San Jose', 1850.00, 'new'),
      ('pws', 'Sarah Jenkins', 'sjenkins@gmail.com', '(650) 555-4432', NULL, 'Residential Trash Bin Sanitization ($35/mo)', 'Monthly Subscription', '2 Bins', 'Sunnyvale', 35.00, 'completed')
    `);

    // Seed Clients
    await db.runAsync(`
      INSERT INTO clients (business_unit, customer_id, name, company_name, email, phone, facility_address, city, active_plan, monthly_rate, next_service_date) VALUES
      ('pws', 'HYG-PWS-1049', 'Johnathan Miller', 'Miller Tech Residences', 'client@hygeiapws.com', '(650) 933-3823', '4820 Innovation Way, Suite 100', 'Santa Clara', 'Commercial Bin & Walkway Pro ($249/mo)', 249.00, 'Tomorrow, 7:30 AM'),
      ('janitorial', 'HYG-JS-2088', 'Sarah Lin', 'Apex Biotech Laboratories', 'slin@apexbiotech.com', '(650) 555-3211', '1200 BioWay Blvd', 'Palo Alto', 'Medical & Cleanroom Master Tier', 5800.00, 'Tonight, 9:00 PM')
    `);

    // Seed Work Orders
    await db.runAsync(`
      INSERT INTO work_orders (client_id, client_name, service_name, scope_description, requested_date, urgency, price, status, crew_assigned) VALUES
      (1, 'Miller Tech Residences', 'Post-Event High-Pressure Grease Remediation', 'Dumpster pad degreasing and loading dock hot-water wash', '2026-09-08', 'standard', 380.00, 'approved', 'Truck Unit Rig-01 (Carlos M.)'),
      (2, 'Apex Biotech Laboratories', 'Emergency ISO-7 Cleanroom Decontamination', 'Spill remediation and cleanroom wall wiping', '2026-09-05', 'emergency', 1200.00, 'dispatched', 'Team Alpha (Hector S.)')
    `);

    // Seed Route Stops (PWS Truck Routes)
    await db.runAsync(`
      INSERT INTO route_stops (truck_unit, driver_name, stop_order, client_name, address, city, bins_count, service_window, status) VALUES
      ('Rig-01', 'Carlos Mendez', 1, 'Miller Tech Residences', '4820 Innovation Way', 'Santa Clara', 6, '07:30 - 08:15 AM', 'completed'),
      ('Rig-01', 'Carlos Mendez', 2, 'Sunnyvale Plaza Lofts', '1240 Mathilda Ave', 'Sunnyvale', 4, '08:45 - 09:30 AM', 'en_route'),
      ('Rig-01', 'Carlos Mendez', 3, 'Palo Alto Bio Center', '350 El Camino Real', 'Palo Alto', 8, '10:00 - 11:00 AM', 'pending'),
      ('Rig-01', 'Carlos Mendez', 4, 'Mountain View Town Ctr', '850 Castro St', 'Mountain View', 5, '11:30 - 12:15 PM', 'pending')
    `);

    // Seed Invoices
    await db.runAsync(`
      INSERT INTO invoices (invoice_number, client_id, client_name, amount, issue_date, due_date, status) VALUES
      ('INV-2026-089', 1, 'Miller Tech Residences', 249.00, 'Sep 01, 2026', 'Sep 15, 2026', 'paid'),
      ('INV-2026-088', 1, 'Miller Tech Residences', 249.00, 'Aug 01, 2026', 'Aug 15, 2026', 'paid'),
      ('INV-2026-087', 1, 'Miller Tech Residences', 380.00, 'Jul 15, 2026', 'Jul 30, 2026', 'paid'),
      ('INV-2026-090', 2, 'Apex Biotech Laboratories', 5800.00, 'Sep 01, 2026', 'Sep 15, 2026', 'paid')
    `);

    console.log('✅ Initial seed data populated successfully!');
  }
}

module.exports = {
  db,
  initDatabase
};
