import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ====== Ensure /server/database exists ======
const dbFolder = path.join(__dirname, "database");

if (!fs.existsSync(dbFolder)) {
  fs.mkdirSync(dbFolder, { recursive: true });
  console.log("📁 Dossier database créé automatiquement.");
}

// ====== Open SQLite database ======
const dbPath = path.join(dbFolder, "main.db");
const db = new Database(dbPath);

console.log("✅ Base SQLite chargée :", dbPath);

export default db;
