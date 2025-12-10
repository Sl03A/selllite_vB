import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'database.sqlite');
const db = new Database(DB_PATH);

// Run migrations
const initSql = fs.readFileSync(path.join(__dirname,'migrations','init.sql'), 'utf8');
db.exec(initSql);

export default db;
