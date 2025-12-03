import Database from "better-sqlite3";
import bcrypt from "bcrypt";

// chemin vers la base sur Render
const db = new Database("./database.db");

// Générer un mot de passe clair
const password = "admin123";
const hash = bcrypt.hashSync(password, 10);

db.prepare(`
    INSERT OR REPLACE INTO users (email, password, is_admin)
    VALUES (?, ?, 1)
`).run("admin@local", hash);

console.log("\n----------------------------------");
console.log("     ADMIN CRÉÉ AVEC SUCCÈS");
console.log("----------------------------------");
console.log("Email : admin@local");
console.log("Mot de passe : admin123");
console.log("----------------------------------\n");

db.close();
