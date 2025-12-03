import express from 'express';
import db from '../db.js';
const router = express.Router();

router.get('/', (req,res)=>{
  const rows = db.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
  res.json(rows);
});

router.get('/:id', (req,res)=>{
  const id = Number(req.params.id);
  const p = db.prepare('SELECT * FROM products WHERE id=?').get(id);
  if(!p) return res.status(404).json({error:'not found'});
  res.json(p);
});

export default router;
