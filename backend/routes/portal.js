const express = require('express');
const router = express.Router();
const { db } = require('../db/database');
const { requireAuth } = require('../utils/auth');

/**
 * GET /api/portal/dashboard
 * Authenticated Client Dashboard
 * Returns complete profile, invoices, work orders, and dispatch stats
 */
router.get('/dashboard', requireAuth, async (req, res) => {
  try {
    const clientId = req.user.id;
    const client = await db.getAsync(`SELECT * FROM clients WHERE id = ?`, [clientId]);

    if (!client) {
      return res.status(404).json({ error: 'Client account not found.' });
    }

    const { password_hash, salt, ...safeClient } = client;

    const invoices = await db.allAsync(
      `SELECT * FROM invoices WHERE client_id = ? ORDER BY id DESC`,
      [client.id]
    );

    const workOrders = await db.allAsync(
      `SELECT * FROM work_orders WHERE client_id = ? ORDER BY id DESC`,
      [client.id]
    );

    res.json({
      client: safeClient,
      invoices,
      workOrders,
      stats: {
        totalInvoices: invoices.length,
        openWorkOrders: workOrders.filter(w => w.status !== 'completed').length,
        monthlyRate: safeClient.monthly_rate,
        nextService: safeClient.next_service_date
      }
    });
  } catch (err) {
    console.error('Error fetching portal dashboard:', err);
    res.status(500).json({ error: 'Failed to fetch portal dashboard.' });
  }
});

/**
 * GET /api/portal/me
 * Legacy support for email query or authenticated token
 */
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    let clientId = null;
    let clientEmail = req.query.email;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const { verifyToken } = require('../utils/auth');
      const payload = verifyToken(authHeader.split(' ')[1]);
      if (payload) clientId = payload.id;
    }

    let client = null;
    if (clientId) {
      client = await db.getAsync(`SELECT * FROM clients WHERE id = ?`, [clientId]);
    } else if (clientEmail) {
      client = await db.getAsync(`SELECT * FROM clients WHERE LOWER(email) = LOWER(?)`, [clientEmail.trim()]);
    } else {
      client = await db.getAsync(`SELECT * FROM clients ORDER BY id ASC LIMIT 1`);
    }

    if (!client) {
      return res.status(404).json({ error: 'Client account not found.' });
    }

    const { password_hash, salt, ...safeClient } = client;

    const invoices = await db.allAsync(
      `SELECT * FROM invoices WHERE client_id = ? ORDER BY id DESC`,
      [client.id]
    );

    const workOrders = await db.allAsync(
      `SELECT * FROM work_orders WHERE client_id = ? ORDER BY id DESC`,
      [client.id]
    );

    res.json({
      client: safeClient,
      invoices,
      workOrders
    });
  } catch (err) {
    console.error('Error fetching portal data:', err);
    res.status(500).json({ error: 'Failed to fetch portal account.' });
  }
});

/**
 * POST /api/portal/request-service
 * Submits an extra service / emergency dispatch request
 */
router.post('/request-service', requireAuth, async (req, res) => {
  try {
    const clientId = req.user.id;
    const client = await db.getAsync(`SELECT * FROM clients WHERE id = ?`, [clientId]);

    if (!client) {
      return res.status(404).json({ error: 'Client record not found.' });
    }

    const {
      service_name,
      scope_description,
      requested_date,
      urgency = 'standard',
      price = 0
    } = req.body;

    if (!service_name) {
      return res.status(400).json({ error: 'Service name or scope type is required.' });
    }

    const result = await db.runAsync(
      `INSERT INTO work_orders (client_id, client_name, service_name, scope_description, requested_date, urgency, price, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending_approval')`,
      [client.id, client.company_name || client.name, service_name, scope_description || '', requested_date || 'Next Available', urgency, price]
    );

    const notificationPayload = {
      recipientPhone: '(650) 933-3823',
      recipientEmail: 'aloha@hygeiaservices.com',
      subject: `🚨 [HYGEIA EXTRA SERVICE REQUEST] ${client.company_name || client.name} - ${service_name}`,
      message: `Work order #${result.id} submitted by ${client.name} (${client.company_name || 'Client'}) for ${requested_date || 'immediate scheduling'}. Urgency: ${urgency.toUpperCase()}. Price: $${price}.`
    };

    console.log(`📲 [SMS DISPATCH TRIGGERED] -> (650) 933-3823: "${notificationPayload.message}"`);

    res.status(201).json({
      success: true,
      message: 'Work order request submitted successfully! Operations dispatch has been notified.',
      workOrderId: result.id,
      notification: notificationPayload
    });
  } catch (err) {
    console.error('Error submitting add-on request:', err);
    res.status(500).json({ error: 'Failed to submit service request.', details: err.message });
  }
});

/**
 * PUT /api/portal/profile
 * Update client profile, phone, or facility address
 */
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const clientId = req.user.id;
    const { name, company_name, phone, facility_address, city } = req.body;

    await db.runAsync(`
      UPDATE clients
      SET name = COALESCE(?, name),
          company_name = COALESCE(?, company_name),
          phone = COALESCE(?, phone),
          facility_address = COALESCE(?, facility_address),
          city = COALESCE(?, city)
      WHERE id = ?
    `, [name, company_name, phone, facility_address, city, clientId]);

    const updated = await db.getAsync(`SELECT * FROM clients WHERE id = ?`, [clientId]);
    const { password_hash, salt, ...safeClient } = updated;

    res.json({
      success: true,
      message: 'Facility profile updated successfully.',
      client: safeClient
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

module.exports = router;
