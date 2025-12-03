import express from 'express';
import db from '../db.js';
import bcrypt from 'bcrypt';
const router = express.Router();

router.post('/register', express.json(), (req,res)=>{
  const { email, password } = req.body;
  if(!email || !password) return res.status(400).json({ error: 'missing' });
  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if(exists) return res.status(400).json({ error: 'exists' });
  const hash = bcrypt.hashSync(password, 10);
  const info = db.prepare('INSERT INTO users(email,password_hash,role) VALUES(?,?,?)').run(email, hash, 'user');
  req.session.user = { id: info.lastInsertRowid, email, role: 'user' };
  res.json({ ok: true, email });
});

router.post('/login', express.json(), (req,res)=>{
  const { email, password } = req.body;
  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if(!row) return res.status(401).json({ error: 'invalid' });
  const ok = bcrypt.compareSync(password, row.password_hash);
  if(!ok) return res.status(401).json({ error: 'invalid' });
  req.session.user = { id: row.id, email: row.email, role: row.role };
  res.json({ ok: true, email: row.email, role: row.role });
});

router.post('/logout', (req,res)=>{
  req.session.destroy(err=>{ if(err) return res.status(500).json({ error:'failed' }); res.json({ ok:true }); });
});

router.get('/me', (req,res)=>{
  if(req.session && req.session.user) return res.json({ user: req.session.user });
  return res.json({ user: null });
});

export default router;
