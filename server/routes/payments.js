import express from 'express';
import db from '../db.js';
import Stripe from 'stripe';

// FIX IMPORT COMMONJS → ES MODULE
import Coinbase from 'coinbase-commerce-node';
const { Client, resources } = Coinbase;
const { Charge } = resources;

const router = express.Router();

// Stripe init
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-08-16'
});

// Coinbase init
Client.init(process.env.COINBASE_COMMERCE_API_KEY);


/* ----------------------------------------------
   STRIPE CHECKOUT SESSION
------------------------------------------------*/
router.post('/create-checkout-session', async (req, res) => {
  const { productId, email } = req.body;

  const p = db.prepare('SELECT * FROM products WHERE id=?').get(productId);
  if (!p) return res.status(400).json({ error: 'Produit inconnu' });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: p.currency,
        product_data: { name: p.title },
        unit_amount: p.price_cents
      },
      quantity: 1
    }],
    mode: 'payment',
    success_url: `${process.env.BASE_URL}/checkout-success.html?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.BASE_URL}/checkout-cancel.html`,
    metadata: {
      productId: p.id,
      userEmail: email
    }
  });

  db.prepare(`
    INSERT INTO orders(product_id,email,amount_cents,currency,payment_provider,payment_id,status)
    VALUES(?,?,?,?,?,?,?)
  `).run(p.id, email, p.price_cents, p.currency, 'stripe', session.id, 'pending');

  res.json({
    sessionId: session.id,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
  });
});


/* ----------------------------------------------
   COINBASE CRYPTO PAYMENT
------------------------------------------------*/
router.post('/create-crypto-charge', async (req, res) => {
  const { productId, email } = req.body;

  const p = db.prepare('SELECT * FROM products WHERE id=?').get(productId);
  if (!p) return res.status(400).json({ error: 'Produit inconnu' });

  const chargeData = {
    name: p.title,
    description: `Paiement ${p.title}`,
    local_price: {
      amount: (p.price_cents / 100).toFixed(2),
      currency: p.currency.toUpperCase()
    },
    pricing_type: 'fixed_price'
  };

  const charge = await Charge.create(chargeData);

  db.prepare(`
    INSERT INTO orders(product_id,email,amount_cents,currency,payment_provider,payment_id,status)
    VALUES(?,?,?,?,?,?,?)
  `).run(p.id, email, p.price_cents, p.currency, 'coinbase', charge.id, 'pending');

  res.json({ hosted_url: charge.hosted_url });
});


/* ----------------------------------------------
   STRIPE WEBHOOK
------------------------------------------------*/
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (e) {
    console.error('stripe webhook error', e);
    return res.status(400).send(`Webhook Error: ${e.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    const ord = db.prepare('SELECT * FROM orders WHERE payment_id=?').get(session.id);

    if (ord) {
      db.prepare('UPDATE orders SET status=? WHERE id=?').run('paid', ord.id);

      // auto delivery key
      const key = 'KEY-' + Math.random().toString(36).slice(2, 12).toUpperCase();
      db.prepare('INSERT INTO delivered_keys(order_id,key_text) VALUES(?,?)')
        .run(ord.id, key);

      console.log('Auto-delivered key for order', ord.id, key);
    }
  }

  res.json({ received: true });
});


/* ----------------------------------------------
   COINBASE WEBHOOK
------------------------------------------------*/
router.post('/webhook/coinbase', express.json(), (req, res) => {
  const event = req.body;

  if (event && event.type === 'charge:confirmed') {
    const charge = event.data;
    const ord = db.prepare('SELECT * FROM orders WHERE payment_id=?').get(charge.id);

    if (ord) {
      db.prepare('UPDATE orders SET status=? WHERE id=?').run('paid', ord.id);
      const key = 'KEY-' + Math.random().toString(36).slice(2, 12).toUpperCase();
      db.prepare('INSERT INTO delivered_keys(order_id,key_text) VALUES(?,?)')
        .run(ord.id, key);
      console.log('Auto-delivered key for order', ord.id, key);
    }
  }

  res.json({ ok: true });
});

export default router;
