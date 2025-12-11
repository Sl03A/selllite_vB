import express from 'express';
import db from '../db.js';
const router = express.Router();

// Mock checkout: accept productId, qty, email -> create order, decrement stock
router.post('/create-checkout-session', express.json(), (req,res)=>{
  const { productId, qty, email } = req.body;
  const p = db.prepare('SELECT id,stock,price_cents FROM products WHERE id=?').get(productId);
  if(!p) return res.status(404).json({ error: 'product not found' });
  if(p.stock < (qty||1)) return res.status(400).json({ error: 'not enough stock' });
  // decrement stock and create order
  const newStock = p.stock - (qty||1);
  db.prepare('UPDATE products SET stock=? WHERE id=?').run(newStock, productId);
  const info = db.prepare('INSERT INTO orders(product_id,quantity,email,status) VALUES (?,?,?,?)').run(productId, qty||1, email||'', 'paid');
  const orderId = info.lastInsertRowid;
  res.json({ orderId });
});

export default router;
