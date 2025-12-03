import express from 'express';
import db from '../db.js';
import bcrypt from 'bcrypt';
import { ensureAdmin } from '../auth.js';
const router = express.Router();

// admin login route (use session)
router.post('/login', express.json(), (req,res)=>{
  const { email, password } = req.body;
  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if(!row) return res.status(401).json({ error: 'invalid' });
  const ok = bcrypt.compareSync(password, row.password_hash);
  if(!ok) return res.status(401).json({ error: 'invalid' });
  req.session.user = { id: row.id, email: row.email, role: row.role };
  res.json({ ok: true });
});

// CRUD products (admin only)
router.get('/products', ensureAdmin, (req,res)=>{
  const rows = db.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
  res.json(rows);
});

router.post('/products', ensureAdmin, express.json(), (req,res)=>{
  const { title, slug, description, price_cents } = req.body;
  const info = db.prepare('INSERT INTO products(title,slug,description,price_cents) VALUES(?,?,?,?)').run(title, slug, description||'', price_cents);
  res.json({ id: info.lastInsertRowid });
});

router.put('/products/:id', ensureAdmin, express.json(), (req,res)=>{
  const id = Number(req.params.id);
  const { title, slug, description, price_cents } = req.body;
  db.prepare('UPDATE products SET title=?,slug=?,description=?,price_cents=? WHERE id=?').run(title, slug, description, price_cents, id);
  res.json({ ok: true });
});

router.delete('/products/:id', ensureAdmin, (req,res)=>{
  const id = Number(req.params.id);
  db.prepare('DELETE FROM products WHERE id=?').run(id);
  res.json({ ok: true });
});

// orders (admin)
router.get('/orders', ensureAdmin, (req,res)=>{
  const rows = db.prepare('SELECT o.*, p.title as product_title FROM orders o JOIN products p ON p.id=o.product_id ORDER BY o.created_at DESC').all();
  res.json(rows);
});

export default router;
