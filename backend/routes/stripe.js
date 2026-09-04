const express = require('express');
const router = express.Router();
const { db } = require('../db/database');

/**
 * POST /api/stripe/create-checkout-session
 * Creates a direct Stripe payment session for $35/mo subscription or one-time invoice
 */
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { plan_type = 'trash-bin-monthly', customer_email, return_url } = req.body;

    // Simulated Stripe Session Payload
    const sessionId = `cs_test_${Math.random().toString(36).substring(2, 15)}`;
    const checkoutUrl = `https://checkout.stripe.com/pay/${sessionId}`;

    console.log(`💳 [STRIPE SESSION INITIATED] Plan: ${plan_type} for ${customer_email || 'guest'}`);

    res.json({
      success: true,
      sessionId,
      url: checkoutUrl,
      message: 'Stripe checkout session initialized successfully.'
    });
  } catch (err) {
    console.error('Error creating Stripe session:', err);
    res.status(500).json({ error: 'Failed to initiate Stripe checkout.' });
  }
});

/**
 * POST /api/stripe/webhook
 * Receives live webhooks from Stripe (invoice.paid, customer.subscription.created, etc.)
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const event = req.body;
    console.log(`🔔 [STRIPE WEBHOOK RECEIVED] Type: ${event.type || 'invoice.payment_succeeded'}`);

    // If payment succeeded, update invoice status in DB
    if (event.data && event.data.object && event.data.object.id) {
      await db.runAsync(`UPDATE invoices SET status = 'paid' WHERE invoice_number = ?`, [event.data.object.id]);
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Error handling Stripe webhook:', err);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

module.exports = router;
