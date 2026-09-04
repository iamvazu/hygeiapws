/**
 * HYGEIA ENTERPRISE — AUTHENTICATION ROUTER
 * Client Registration, Client Login, Admin Login, Token Verification
 */

const express = require('express');
const router = express.Router();
const { db } = require('../db/database');
const { hashPassword, verifyPassword, generateToken, requireAuth } = require('../utils/auth');

/**
 * POST /api/auth/register
 * Self-service registration for new enterprise or residential clients
 */
router.post('/register', async (req, res) => {
  try {
    const {
      name,
      company_name,
      email,
      password,
      phone,
      facility_address,
      city,
      business_unit = 'janitorial',
      active_plan = 'Standard Facility Cleaning Plan'
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Full Name, Email Address, and Password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters in length.' });
    }

    // Check if client already exists
    const existing = await db.getAsync('SELECT id FROM clients WHERE email = ?', [email.trim().toLowerCase()]);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email address already exists. Please sign in.' });
    }

    // Generate unique Customer ID
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const prefix = business_unit === 'pws' ? 'HYG-PWS' : 'HYG-JS';
    const customer_id = `${prefix}-${randomSuffix}`;

    const { hash, salt } = hashPassword(password);

    const result = await db.runAsync(`
      INSERT INTO clients (
        business_unit, customer_id, name, company_name, email, phone,
        password_hash, salt, role, facility_address, city, active_plan,
        monthly_rate, next_service_date, payment_method, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'client', ?, ?, ?, 0.00, 'Initial Dispatch Scheduling', 'Pending Setup', 'active')
    `, [
      business_unit,
      customer_id,
      name.trim(),
      company_name ? company_name.trim() : null,
      email.trim().toLowerCase(),
      phone || null,
      hash,
      salt,
      facility_address || null,
      city || 'Silicon Valley Area',
      active_plan
    ]);

    const newClient = await db.getAsync(`
      SELECT id, business_unit, customer_id, name, company_name, email, phone, role, facility_address, city, active_plan, monthly_rate, next_service_date, payment_method, status, created_at
      FROM clients WHERE id = ?
    `, [result.id]);

    const token = generateToken({
      id: newClient.id,
      email: newClient.email,
      name: newClient.name,
      role: 'client',
      business_unit: newClient.business_unit,
      customer_id: newClient.customer_id
    });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully! Welcome to Hygeia Enterprise.',
      token,
      client: newClient
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to complete registration.', details: err.message });
  }
});

/**
 * POST /api/auth/login
 * Client authentication
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const client = await db.getAsync(`
      SELECT * FROM clients WHERE LOWER(email) = LOWER(?)
    `, [email.trim()]);

    if (!client || !client.password_hash) {
      return res.status(401).json({ error: 'Invalid email address or password.' });
    }

    const isValid = verifyPassword(password, client.password_hash, client.salt);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email address or password.' });
    }

    const token = generateToken({
      id: client.id,
      email: client.email,
      name: client.name,
      role: client.role || 'client',
      business_unit: client.business_unit,
      customer_id: client.customer_id
    });

    // Remove sensitive hash from returned payload
    const { password_hash, salt, ...safeClient } = client;

    res.json({
      success: true,
      message: `Welcome back, ${client.name}!`,
      token,
      client: safeClient
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Authentication failed.', details: err.message });
  }
});

/**
 * POST /api/auth/admin-login
 * Administrative Command Center Login
 */
router.post('/admin-login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Admin username/email and password are required.' });
    }

    const admin = await db.getAsync(`
      SELECT * FROM admin_users WHERE LOWER(username) = LOWER(?)
    `, [username.trim()]);

    if (!admin) {
      return res.status(401).json({ error: 'Invalid administrative credentials.' });
    }

    const isValid = verifyPassword(password, admin.password_hash, admin.salt);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid administrative credentials.' });
    }

    await db.runAsync(`UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?`, [admin.id]);

    const token = generateToken({
      id: admin.id,
      username: admin.username,
      role: 'admin',
      type: 'superadmin'
    });

    res.json({
      success: true,
      message: 'Admin authentication verified. Access granted.',
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        role: admin.role
      }
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: 'Admin login failed.', details: err.message });
  }
});

/**
 * GET /api/auth/me
 * Validate active session token and return user profile
 */
router.get('/me', requireAuth, async (req, res) => {
  try {
    if (req.user.role === 'admin' || req.user.role === 'superadmin') {
      const admin = await db.getAsync(`SELECT id, username, role, last_login FROM admin_users WHERE id = ?`, [req.user.id]);
      return res.json({ user: admin, role: 'admin' });
    }

    const client = await db.getAsync(`
      SELECT id, business_unit, customer_id, name, company_name, email, phone, role, facility_address, city, active_plan, monthly_rate, next_service_date, payment_method, status, created_at
      FROM clients WHERE id = ?
    `, [req.user.id]);

    if (!client) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    res.json({ user: client, role: 'client' });
  } catch (err) {
    console.error('Auth me error:', err);
    res.status(500).json({ error: 'Failed to verify session.' });
  }
});

module.exports = router;
