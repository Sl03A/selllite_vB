import express from 'express';
import session from 'express-session';
import SQLiteStore from 'connect-sqlite3';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
import db from './db.js';
import { createAdminIfNotExists } from './auth.js';
import productsRouter from './routes/products.js';
import adminRouter from './routes/admin.js';
import cartRouter from './routes/cart.js';
import paymentsRouter from './routes/payments.js';
import userRouter from './routes/userAuth.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(session({
  store: new (SQLiteStore(session))({ db: 'sessions.sqlite' }),
  secret: process.env.SESSION_SECRET || 'change_me',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true }
}));

createAdminIfNotExists();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '../public')));

// API
app.use('/api/products', productsRouter);
app.use('/api/cart', cartRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/user', userRouter);

// order fetch
app.get('/api/order/:id', (req,res)=>{
  const id = Number(req.params.id);
  const ord = db.prepare('SELECT o.*, p.title as product_title FROM orders o JOIN products p ON p.id=o.product_id WHERE o.id=?').get(id);
  if(!ord) return res.status(404).json({error:'not found'});
  const key = db.prepare('SELECT key_text FROM delivered_keys WHERE order_id=?').get(id);
  res.json({order:ord, key: key ? key.key_text : null});
});

const port = process.env.PORT || 3000;
app.listen(port, ()=>console.log('SellLite v3 running on port', port));
