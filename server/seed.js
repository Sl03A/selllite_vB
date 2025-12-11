import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname,'database.sqlite');
const db = new Database(dbPath);
const initSql = fs.readFileSync(path.join(__dirname,'migrations','init.sql'),'utf8');
db.exec(initSql);

function ensureAdmin(email, pass){
  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if(row) return console.log('Admin exists');
  const hash = bcrypt.hashSync(pass, 10);
  db.prepare('INSERT INTO users(email,password_hash,role) VALUES (?,?,?)').run(email, hash, 'admin');
  console.log('Admin created:', email);
}

function seedProducts(){
  const cnt = db.prepare('SELECT COUNT(*) as c FROM products').get().c;
  if(cnt > 0) return console.log('Products already seeded');
  const insert = db.prepare('INSERT INTO products(title,slug,description,price_cents,image_url,stock) VALUES (?,?,?,?,?,?)');
  insert.run('Pack de démarrage','pack-demarrage','Pack de démarrage SellLite',499,'/uploads/sample1.jpg',10);
  insert.run('Clé d activation','cle-activation','Licence numérique',1499,'/uploads/sample2.jpg',5);
  insert.run('E-book Guide','ebook-guide','Guide complet',999,'/uploads/sample3.jpg',100);
  console.log('Inserted sample products');
}

ensureAdmin(process.env.ADMIN_EMAIL||'admin@example.com', process.env.ADMIN_PASS||'admin123');
seedProducts();
