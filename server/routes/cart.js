import express from 'express';
import db from '../db.js';
const router = express.Router();

router.get('/', (req,res)=>{
  const cart = req.session.cart || { items: [] };
  res.json(cart);
});

router.post('/add', express.json(), (req,res)=>{
  const { productId, qty } = req.body;
  const p = db.prepare('SELECT * FROM products WHERE id=?').get(productId);
  if(!p) return res.status(400).json({ error: 'product not found' });
  req.session.cart = req.session.cart || { items: [] };
  const existing = req.session.cart.items.find(i=>i.productId===productId);
  if(existing) existing.qty += qty || 1;
  else req.session.cart.items.push({ productId, qty: qty || 1, title: p.title, price_cents: p.price_cents });
  res.json(req.session.cart);
});

router.post('/remove', express.json(), (req,res)=>{
  const { productId } = req.body;
  if(!req.session.cart) return res.json({ items: [] });
  req.session.cart.items = req.session.cart.items.filter(i=>i.productId!==productId);
  res.json(req.session.cart);
});

router.post('/clear', (req,res)=>{
  req.session.cart = { items: [] };
  res.json(req.session.cart);
});

export default router;
