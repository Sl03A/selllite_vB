import express from 'express';
import db from '../db.js';
const router = express.Router();

// session-based cart (simple)
router.get('/', (req,res)=>{
  const cart = req.session.cart || { items: [] };
  res.json(cart);
});

router.post('/add', express.json(), (req,res)=>{
  const { product_id, qty } = req.body;
  const p = db.prepare('SELECT id,title,price_cents,stock FROM products WHERE id=?').get(product_id);
  if(!p) return res.status(404).json({ error: 'product not found' });
  if(p.stock < (qty || 1)) return res.status(400).json({ error: 'not enough stock' });
  if(!req.session.cart) req.session.cart = { items: [] };
  const existing = req.session.cart.items.find(i=>i.productId===p.id);
  if(existing) existing.qty += (qty||1); else req.session.cart.items.push({ productId: p.id, title: p.title, price_cents: p.price_cents, qty: qty||1 });
  res.json({ ok:true, cart: req.session.cart });
});

router.post('/remove', express.json(), (req,res)=>{
  const { productId } = req.body;
  if(!req.session.cart) return res.json({ ok:true });
  req.session.cart.items = req.session.cart.items.filter(i=>i.productId!==productId);
  res.json({ ok:true, cart: req.session.cart });
});

router.post('/clear', (req,res)=>{ req.session.cart = { items: [] }; res.json({ ok:true }); });

export default router;
