import express from "express";
import session from "express-session";
import Database from "better-sqlite3";
import path from "path";
import bodyParser from "body-parser";
import cors from "cors";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

// Fix __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database
const db = new Database("./database/main.db");

// Create sessions table if not exists
db.prepare(`
  CREATE TABLE IF NOT EXISTS sessions (
    sid TEXT PRIMARY KEY,
    sess TEXT NOT NULL,
    expire INTEGER NOT NULL
  )
`).run();

// Custom SQLite session store
const SQLiteStore = {
  get: (sid, cb) => {
    try {
      const row = db
        .prepare("SELECT sess FROM sessions WHERE sid = ? AND expire > ?")
        .get(sid, Date.now());
      cb(null, row ? JSON.parse(row.sess) : null);
    } catch (err) {
      cb(err);
    }
  },

  set: (sid, sess, cb) => {
    try {
      const expire = Date.now() + 86400000;
      db.prepare(`
        INSERT INTO sessions (sid, sess, expire)
        VALUES (?, ?, ?)
        ON CONFLICT(sid) DO UPDATE SET sess=excluded.sess, expire=excluded.expire
      `).run(sid, JSON.stringify(sess), expire);
      cb(null);
    } catch (err) {
      cb(err);
    }
  },

  destroy: (sid, cb) => {
    try {
      db.prepare("DELETE FROM sessions WHERE sid = ?").run(sid);
      cb(null);
    } catch (err) {
      cb(err);
    }
  }
};

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../public")));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecret",
    resave: false,
    saveUninitialized: false,
    store: SQLiteStore,
    cookie: { maxAge: 86400000 } // 24h
  })
);

// Test route admin login
app.post("/api/admin/login", (req, res) => {
    const { username, password } = req.body;

    if (username === "admin" && password === "admin123") {
        req.session.admin = true;
        return res.json({ success: true });
    }

    return res.status(401).json({ success: false, error: "Invalid credentials" });
});

app.get("/api/admin/check", (req, res) => {
    res.json({ admin: !!req.session.admin });
});

// Serve frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Start server
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
