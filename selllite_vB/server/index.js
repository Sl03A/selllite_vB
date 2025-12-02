import express from 'express';
import session from 'express-session';
import SQLiteStore from 'connect-sqlite3';
import dotenv from 'dotenv';
import path from 'path';
import { createAdminIfNotExists } from './auth.js';
import publicRoutes from './routes/public.js';
import payments from './routes/payments.js';
import adminRoutes from './routes/admin.js';
import db from './db.js';
dotenv.config();
const app = express();
app.use(express.json()); app.use(express.urlencoded({extended:true}));
app.use(session({
  store: new (SQLiteStore(session))({ db: 'sessions.sqlite' }),
  secret: process.env.SESSION_SECRET || 'change_me',
  resave: false, saveUninitialized: false, cookie: { secure: false, httpOnly: true }
}));
createAdminIfNotExists();
app.use(express.static('public'));
app.use('/', publicRoutes);
app.use('/', payments);
app.use('/admin/api', adminRoutes);
const port = process.env.PORT || 3000;
app.listen(port, ()=>console.log(`Server running on ${port}`));
