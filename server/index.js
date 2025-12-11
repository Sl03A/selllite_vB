import express from "express";
import session from "express-session";
import SQLiteStoreFactory from "connect-sqlite3";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// ====== CREATE DATABASE FOLDER IF MISSING ======
const dbFolder = path.join(__dirname, "database");
if (!fs.existsSync(dbFolder)) {
  fs.mkdirSync(dbFolder, { recursive: true });
  console.log("📁 Dossier database créé automatiquement.");
}

// ====== INIT BETTER-SQLITE3 ======
const dbPath = path.join(dbFolder, "main.db");
const db = new Database(dbPath);
console.log("✅ Base SQLite chargée :", dbPath);

// ====== SESSION STORE FIXED ======
const SQLiteStore = SQLiteStoreFactory(session);
app.use(
  session({
    store: new SQLiteStore({
      dir: dbFolder,
      db: "sessions.db",
    }),
    secret: "mysecret",
    resave: false,
    saveUninitialized: false,
  })
);

// ====== MIDDLEWARE ======
app.use(cors());
app.use(express.json());

// ====== ROUTES ======
import productsRouter from "./routes/products.js";
app.use("/api/products", productsRouter);

// ====== START SERVER ======
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log("🚀 Server running on port", PORT));
