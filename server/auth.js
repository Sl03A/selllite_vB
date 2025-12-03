import bcrypt from 'bcrypt';
import db from './db.js';
import dotenv from 'dotenv';
dotenv.config();

export async function ensureAdmin(req,res,next){
  if(req.session && req.session.user && req.session.user.role === 'admin') return next();
  return res.status(401).json({error:'unauthorized'});
}

export function createAdminIfNotExists(){
  const row = db.prepare('SELECT COUNT(*) as c FROM users').get();
  if(row.c === 0){
    const defaultPass = process.env.ADMIN_PASSWORD || 'admin123';
    const hash = bcrypt.hashSync(defaultPass,10);
    db.prepare('INSERT INTO users(email,password_hash,role) VALUES(?,?,?)').run(process.env.ADMIN_EMAIL || 'admin@local', hash, 'admin');
    console.log('Admin user created:', process.env.ADMIN_EMAIL || 'admin@local');
  }
}
