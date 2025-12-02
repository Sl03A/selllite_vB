import express from 'express';
import db from '../db.js';
import { ensureAdmin } from '../auth.js';
const router = express.Router();
router.get('/products', ensureAdmin, (req,res)=>{
  const rows = db.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
  res.json(rows);
});
router.post('/products', ensureAdmin, (req,res)=>{
  const {title,slug,description,price_cents,currency} = req.body;
  const info = db.prepare('INSERT INTO products(title,slug,description,price_cents,currency) VALUES(?,?,?,?,?)').run(title,slug,description,price_cents,currency);
  res.json({id:info.lastInsertRowid});
});
router.delete('/products/:id', ensureAdmin, (req,res)=>{
  db.prepare('DELETE FROM products WHERE id=?').run(req.params.id);
  res.json({ok:true});
});
router.get('/orders', ensureAdmin, (req,res)=>{
  const rows = db.prepare(`SELECT o.*, p.title as product_title FROM orders o JOIN products p ON p.id=o.product_id ORDER BY o.created_at DESC`).all();
  res.json(rows);
});
router.post('/orders/:id/deliver', ensureAdmin, (req,res)=>{
  const {id} = req.params; const {key_text} = req.body;
  db.prepare('UPDATE orders SET status=? WHERE id=?').run('delivered',id);
  db.prepare('INSERT INTO delivered_keys(order_id,key_text) VALUES(?,?)').run(id,key_text);
  res.json({ok:true});
});
export default router;
