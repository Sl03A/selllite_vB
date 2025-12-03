import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(),'server','database.sqlite');
const db = new Database(DB_PATH);

const initSql = fs.readFileSync(path.join(process.cwd(),'server','migrations','init.sql'),'utf8');
db.exec(initSql);

export default db;
