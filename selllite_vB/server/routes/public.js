import express from 'express';
import db from '../db.js';
import bcrypt from 'bcrypt';
const router = express.Router();

// admin login endpoint (session)
router.post('/admin/login', express.json(), async (req,res)=>{
  const {email,password} = req.body;
  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if(!row) return res.status(401).json({error:'invalid'});
  const ok = await bcrypt.compare(password, row.password_hash);
  if(!ok) return res.status(401).json({error:'invalid'});
  req.session.user = {id:row.id,email:row.email,role:row.role};
  res.json({ok:true});
});

// simple public endpoints (example)
router.get('/products.json', (req,res)=>{
  const rows = db.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
  res.json(rows);
});

export default router;
