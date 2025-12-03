import express from 'express';
import db from '../db.js';
const router = express.Router();
// If STRIPE_SECRET_KEY is present, real stripe code could be activated.
// For now this package uses simulated payments by default so you can deploy without keys.
router.post('/create-checkout-session', (req, res) => {
  const { productId, email } = req.body;
  const p = db.prepare('SELECT * FROM products WHERE id=?').get(productId);
  if (!p) return res.status(400).json({ error: 'Produit inconnu' });
  const fakeSessionId = "sess_" + Math.random().toString(36).slice(2, 12);
  const info = db.prepare('INSERT INTO orders(product_id,email,amount_cents,currency,payment_provider,payment_id,status) VALUES(?,?,?,?,?,?,?)')
    .run(p.id,email,p.price_cents,p.currency,'stripe-fake',fakeSessionId,'paid');
  const last = db.prepare('SELECT last_insert_rowid() as id').get().id;
  const key = 'KEY-'+Math.random().toString(36).slice(2,12).toUpperCase();
  db.prepare('INSERT INTO delivered_keys(order_id,key_text) VALUES(?,?)').run(last,key);
  res.json({sessionId:fakeSessionId,publishableKey:process.env.STRIPE_PUBLISHABLE_KEY||'test_publishable'});
});
router.post('/create-crypto-charge',(req,res)=>{
  const { productId, email } = req.body;
  const p = db.prepare('SELECT * FROM products WHERE id=?').get(productId);
  if (!p) return res.status(400).json({ error: 'Produit inconnu' });
  const fakeChargeId = 'crypto_'+Math.random().toString(36).slice(2,12);
  db.prepare('INSERT INTO orders(product_id,email,amount_cents,currency,payment_provider,payment_id,status) VALUES(?,?,?,?,?,?,?)')
    .run(p.id,email,p.price_cents,p.currency,'crypto-fake',fakeChargeId,'paid');
  const last = db.prepare('SELECT last_insert_rowid() as id').get().id;
  const key = 'KEY-'+Math.random().toString(36).slice(2,12).toUpperCase();
  db.prepare('INSERT INTO delivered_keys(order_id,key_text) VALUES(?,?)').run(last,key);
  res.json({hosted_url:'/checkout-success.html'});
});
router.post('/webhook/stripe',(req,res)=>res.json({disabled:true}));
router.post('/webhook/coinbase',(req,res)=>res.json({disabled:true}));
export default router;
