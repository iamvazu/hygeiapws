const express = require('express');
const router = express.Router();
const { db } = require('../db/database');

/**
 * POST /api/leads
 * Public endpoint for quote requests from contact forms, bin cleaning builder, site walk modals
 */
router.post('/', async (req, res) => {
  try {
    const {
      business_unit = 'pws',
      customer_name,
      email,
      phone,
      company_name,
      service_type,
      frequency,
      square_footage,
      address,
      city,
      estimated_value = 0,
      notes
    } = req.body;

    if (!customer_name || !email) {
      return res.status(400).json({ error: 'Customer name and email are required.' });
    }

    const result = await db.runAsync(
      `INSERT INTO leads (business_unit, customer_name, email, phone, company_name, service_type, frequency, square_footage, address, city, estimated_value, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')`,
      [business_unit, customer_name, email, phone, company_name, service_type, frequency, square_footage, address, city, estimated_value, notes]
    );

    console.log(`🔔 [LEAD RECEIVED] ${customer_name} (${business_unit.toUpperCase()}) - ${service_type} in ${city || 'Silicon Valley'}`);

    res.status(201).json({
      success: true,
      message: 'Quote request submitted successfully. Our dispatch team will contact you within 24 hours.',
      leadId: result.id
    });
  } catch (err) {
    console.error('Error saving lead:', err);
    res.status(500).json({ error: 'Failed to process quote request.' });
  }
});

/**
 * GET /api/leads
 * Admin query endpoint for retrieving all leads with optional status or business_unit filter
 */
router.get('/', async (req, res) => {
  try {
    const { business_unit, status } = req.query;
    let sql = `SELECT * FROM leads WHERE 1=1`;
    const params = [];

    if (business_unit && business_unit !== 'all') {
      sql += ` AND business_unit = ?`;
      params.push(business_unit);
    }
    if (status && status !== 'all') {
      sql += ` AND status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY id DESC`;
    const leads = await db.allAsync(sql, params);
    res.json({ leads });
  } catch (err) {
    console.error('Error fetching leads:', err);
    res.status(500).json({ error: 'Failed to fetch leads.' });
  }
});

/**
 * PATCH /api/leads/:id
 * Admin endpoint to update lead status, notes, or estimated value
 */
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, estimated_value } = req.body;

    const lead = await db.getAsync(`SELECT * FROM leads WHERE id = ?`, [id]);
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found.' });
    }

    const newStatus = status !== undefined ? status : lead.status;
    const newNotes = notes !== undefined ? notes : lead.notes;
    const newEst = estimated_value !== undefined ? estimated_value : lead.estimated_value;

    await db.runAsync(
      `UPDATE leads SET status = ?, notes = ?, estimated_value = ? WHERE id = ?`,
      [newStatus, newNotes, newEst, id]
    );

    console.log(`📝 [LEAD UPDATED] #${id} status changed to ${newStatus}`);
    res.json({ success: true, message: `Lead #${id} updated successfully.` });
  } catch (err) {
    console.error('Error updating lead:', err);
    res.status(500).json({ error: 'Failed to update lead.' });
  }
});

module.exports = router;
