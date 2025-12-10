import express from 'express';
import session from 'express-session';
import SQLiteStoreFactory from 'connect-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import morgan from 'morgan';

import db from './db.js';
import productRouter from './routes/products.js';
import adminRouter from './routes/admin.js';
import cartRouter from './routes/cart.js';
import paymentsRouter from './routes/payments.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  store: SQLiteStoreFactory({ db: 'sessions.sqlite', dir: path.join(__dirname) }),
  secret: process.env.SESSION_SECRET || 'change_me',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 7*24*3600*1000 }
}));

// serve static
app.use(express.static(path.join(__dirname, '..', 'public')));

// routers
app.use('/api/products', productRouter);
app.use('/api/admin', adminRouter);
app.use('/api/cart', cartRouter);
app.use('/api/payments', paymentsRouter);

// fallback
app.get('/', (req,res)=> res.sendFile(path.join(__dirname,'..','public','index.html')));

const port = process.env.PORT || 3000;
app.listen(port, ()=> console.log('SellLite v3 running on port', port));
