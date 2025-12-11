import express from "express";
import session from "express-session";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import db from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// ====== CREATE DATABASE FOLDER IF MISSING (db.js already ensures it) ======

// ====== SESSION STORE: custom using better-sqlite3 ======
class SQLiteStore extends session.Store {
  constructor(dbInstance, options = {}) {
    super();
    this.db = dbInstance;
    this.ttl = options.ttl || 24*3600*1000;
  }

  get(sid, callback) {
    try {
      const row = this.db.prepare('SELECT sess FROM sessions WHERE sid = ? AND expire > ?').get(sid, Date.now());
      if(!row) return callback(null, null);
      const sess = JSON.parse(row.sess);
      callback(null, sess);
    } catch (err) { callback(err); }
  }

  set(sid, sess, callback) {
    try {
      const expire = Date.now() + this.ttl;
      const s = JSON.stringify(sess);
      this.db.prepare(`
        INSERT INTO sessions (sid, sess, expire)
        VALUES (?, ?, ?)
        ON CONFLICT(sid) DO UPDATE SET sess=excluded.sess, expire=excluded.expire
      `).run(sid, s, expire);
      callback && callback(null);
    } catch (err) { callback && callback(err); }
  }

  destroy(sid, callback) {
    try {
      this.db.prepare('DELETE FROM sessions WHERE sid = ?').run(sid);
      callback && callback(null);
    } catch (err) { callback && callback(err); }
  }
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || "change_me",
  resave: false,
  saveUninitialized: false,
  store: new SQLiteStore(db, { ttl: 7*24*3600*1000 }),
  cookie: { maxAge: 7*24*3600*1000 }
}));

// ====== Serve static public folder ======
const publicPath = path.join(__dirname, "../public");
app.use(express.static(publicPath));
console.log("📁 Serving public from", publicPath);

// ====== API routes ======
import productsRouter from "./routes/products.js";
import adminRouter from "./routes/admin.js";
import cartRouter from "./routes/cart.js";
import paymentsRouter from "./routes/payments.js";

app.use("/api/products", productsRouter);
app.use("/api/admin", adminRouter);
app.use("/api/cart", cartRouter);
app.use("/api/payments", paymentsRouter);

// ====== Fallback to index.html for SPA routes ======
app.get("*", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

// ====== Start server ======
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🚀 Server running on port", PORT));
