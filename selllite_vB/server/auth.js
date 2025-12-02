import bcrypt from 'bcrypt';
import db from './db.js';
export async function ensureAdmin(req,res,next){
  if(req.session && req.session.user && req.session.user.role === 'admin') return next();
  return res.status(401).json({error:'unauthorized'});
}
export async function createAdminIfNotExists(){
  const row = db.prepare('SELECT COUNT(*) as c FROM users').get();
  if(row.c === 0){
    const defaultPass = process.env.ADMIN_DEFAULT_PWD || 'password';
    const hash = await bcrypt.hash(defaultPass,10);
    db.prepare('INSERT INTO users(email,password_hash,role) VALUES(?,?,?)').run('admin@local',hash,'admin');
    console.log('Admin user created: admin@local with default password (change it!)');
  }
}
