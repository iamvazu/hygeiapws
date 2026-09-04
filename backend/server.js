/**
 * HYGEIA ENTERPRISE DIGITAL ECOSYSTEM — MASTER BACKEND SERVER
 * Express REST API Engine for Montero Enterprises Inc.
 * Hosts Power Wash Solutions, Janitorial Services, Client Portal & Admin Hub.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./db/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for Vercel frontends and local dev
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Hygeia Enterprise API Engine',
    company: 'Montero Enterprises Inc.',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Mount Modular API Routes
app.use('/api/leads', require('./routes/leads'));
app.use('/api/portal', require('./routes/portal'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/stripe', require('./routes/stripe'));

// Serve static frontend files if hosted together on Hostinger VPS
const websitePath = path.join(__dirname, '..', 'website');
const jswebsitePath = path.join(__dirname, '..', 'jswebsite');

app.use('/pws', express.static(websitePath));
app.use('/janitorial', express.static(jswebsitePath));

// Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

// Start Server and Initialize Database
async function start() {
  try {
    await initDatabase();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`====================================================`);
      console.log(`🚀 HYGEIA BACKEND API RUNNING ON PORT ${PORT}`);
      console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`📊 Admin API:    http://localhost:${PORT}/api/admin/metrics`);
      console.log(`👤 Portal API:   http://localhost:${PORT}/api/portal/me`);
      console.log(`🔔 Leads API:    http://localhost:${PORT}/api/leads`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('Fatal error starting server:', err);
    process.exit(1);
  }
}

start();
