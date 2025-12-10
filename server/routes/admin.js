import express from 'express';
import db from '../db.js';
import bcrypt from 'bcrypt';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname,'..','public','uploads');
if(!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, uploadDir); },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, 'p_' + Date.now() + ext);
  }
});
const upload = multer({ storage, limits:{ fileSize: 5*1024*1024 } });

// simple ensureAdmin middleware using session
function ensureAdmin(req,res,next){
  if(req.session && req.session.user && req.session.user.role === 'admin') return next();
  return res.status(401).json({ error: 'unauthorized' });
}

// admin login
router.post('/login', express.json(), (req,res)=>{
  const { email, password } = req.body;
  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if(!row) return res.status(401).json({ error: 'invalid' });
  const ok = bcrypt.compareSync(password, row.password_hash);
  if(!ok) return res.status(401).json({ error: 'invalid' });
  req.session.user = { id: row.id, email: row.email, role: row.role };
  res.json({ ok: true });
});

// admin logout
router.post('/logout', (req,res)=>{ req.session.destroy(()=>res.json({ ok:true })); });

// upload image
router.post('/upload', ensureAdmin, upload.single('image'), (req,res)=>{
  if(!req.file) return res.status(400).json({ error: 'no file' });
  const publicPath = '/uploads/' + req.file.filename;
  res.json({ ok:true, url: publicPath });
});

// create product
router.post('/products', ensureAdmin, express.json(), (req,res)=>{
  const { title, slug, description, price_cents, image_url, stock } = req.body;
  const s = slug || (title||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
  try{
    db.prepare('INSERT INTO products(title,slug,description,price_cents,image_url,stock) VALUES (?,?,?,?,?,?)')
      .run(title, s, description||'', Number(price_cents)||0, image_url||null, Number(stock)||0);
    res.json({ ok: true });
  }catch(e){
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// admin list products
router.get('/products', ensureAdmin, (req,res)=>{
  const rows = db.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
  res.json(rows);
});

// get dashboard stats
router.get('/dashboard', ensureAdmin, (req,res)=>{
  const totalProducts = db.prepare('SELECT COUNT(*) as c FROM products').get().c;
  const totalOrders = db.prepare('SELECT COUNT(*) as c FROM orders').get().c;
  const revenue = db.prepare('SELECT SUM(p.price_cents*o.quantity) as r FROM orders o JOIN products p ON p.id=o.product_id').get().r || 0;
  res.json({ totalProducts, totalOrders, revenue });
});

export default router;
