import express from 'express';
import db from '../db.js';
import nodemailer from 'nodemailer';
const router = express.Router();

const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_SECURE = (process.env.SMTP_SECURE === 'true');
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'no-reply@example.com';

let transporter = null;
if(SMTP_HOST && SMTP_USER){
  transporter = nodemailer.createTransport({ host: SMTP_HOST, port: SMTP_PORT, secure: SMTP_SECURE, auth: { user: SMTP_USER, pass: SMTP_PASS } });
}

async function sendKeyEmail(to, productTitle, key, orderId){
  const subject = `Votre clé pour ${productTitle}`;
  const text = `Merci pour votre achat. Clé: ${key} (commande #${orderId})`;
  const html = `<p>Merci pour votre achat — voici votre clé pour <strong>${productTitle}</strong> :</p><pre>${key}</pre><p>Commande #${orderId}</p>`;
  if(transporter){
    try{ await transporter.sendMail({ from: FROM_EMAIL, to, subject, text, html }); console.log('Email sent to', to); return true; }catch(e){ console.error('Email error', e); return false; }
  }else{
    console.log('--- EMAIL (SIMULATED) ---'); console.log('To:', to); console.log('Subject:', subject); console.log('Body:', text); return false;
  }
}

router.post('/create-checkout-session', express.json(), (req,res)=>{
  const { productId, email, qty } = req.body;
  const p = db.prepare('SELECT * FROM products WHERE id=?').get(productId);
  if(!p) return res.status(400).json({ error: 'Produit inconnu' });
  const amount = (p.price_cents) * (qty || 1);
  const fakeSessionId = 'sess_' + Math.random().toString(36).slice(2,12);
  const info = db.prepare('INSERT INTO orders(product_id,email,amount_cents,currency,payment_provider,payment_id,status) VALUES(?,?,?,?,?,?,?)')
    .run(p.id,email,amount,p.currency,'fake',fakeSessionId,'paid');
  const orderId = db.prepare('SELECT last_insert_rowid() as id').get().id;
  const key = 'KEY-' + Math.random().toString(36).slice(2,12).toUpperCase();
  db.prepare('INSERT INTO delivered_keys(order_id,key_text) VALUES(?,?)').run(orderId,key);

  sendKeyEmail(email, p.title, key, orderId).then(()=>{}).catch(()=>{});
  res.json({ orderId, key });
});

export default router;
