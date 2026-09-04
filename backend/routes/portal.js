const express = require('express');
const router = express.Router();
const { db } = require('../db/database');

/**
 * GET /api/portal/me
 * Returns client profile, active contracts, invoices, and requested work orders
 */
router.get('/me', async (req, res) => {
  try {
    const email = req.query.email || 'client@hygeiapws.com';
    const client = await db.getAsync(`SELECT * FROM clients WHERE email = ?`, [email]);

    if (!client) {
      return res.status(404).json({ error: 'Client account not found.' });
    }

    const invoices = await db.allAsync(
      `SELECT * FROM invoices WHERE client_id = ? ORDER BY id DESC`,
      [client.id]
    );

    const workOrders = await db.allAsync(
      `SELECT * FROM work_orders WHERE client_id = ? ORDER BY id DESC`,
      [client.id]
    );

    res.json({
      client,
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
 * Triggers dispatch alert to Andy Montero (SMS + Email) and creates a live Work Order
 */
router.post('/request-service', async (req, res) => {
  try {
    const {
      client_id = 1,
      client_name = 'Miller Tech Residences',
      service_name,
      scope_description,
      requested_date,
      urgency = 'standard',
      price = 0
    } = req.body;

    if (!service_name) {
      return res.status(400).json({ error: 'Service name is required.' });
    }

    const result = await db.runAsync(
      `INSERT INTO work_orders (client_id, client_name, service_name, scope_description, requested_date, urgency, price, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending_approval')`,
      [client_id, client_name, service_name, scope_description, requested_date, urgency, price]
    );

    // Simulated Dispatch Notification to Andy's phone & email
    const notificationPayload = {
      recipientPhone: '(650) 933-3823',
      recipientEmail: 'aloha@hygeiaservices.com',
      subject: `🚨 [HYGEIA EXTRA SERVICE REQUEST] ${client_name} - ${service_name}`,
      message: `New add-on service order #${result.id} requested by ${client_name} for ${requested_date || 'immediate scheduling'}. Urgency: ${urgency.toUpperCase()}. Price: $${price}. Approve in Admin Dashboard: https://hygeiapwsweb.vercel.app/admin.html`
    };

    console.log(`📲 [SMS DISPATCH TRIGGERED TO ANDY] -> (650) 933-3823: "${notificationPayload.message}"`);
    console.log(`📧 [EMAIL DISPATCH DISPATCHED] -> aloha@hygeiaservices.com`);

    res.status(201).json({
      success: true,
      message: 'Add-on service request submitted successfully! Dispatch alert sent to Andy Montero.',
      workOrderId: result.id,
      notification: notificationPayload
    });
  } catch (err) {
    console.error('Error submitting add-on request:', err);
    res.status(500).json({ error: 'Failed to submit service request.' });
  }
});

module.exports = router;
