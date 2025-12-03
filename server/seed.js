import Database from "better-sqlite3";
import bcrypt from "bcrypt";

const db = new Database("database.db");

// Create tables
db.exec(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'user'
);

CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    price REAL,
    image TEXT
);

CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    total REAL,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`);

// Seed admin
const adminEmail = "admin@local";
const adminPassword = "admin123"; // change it once connected
const hashed = bcrypt.hashSync(adminPassword, 10);

try {
    db.prepare("INSERT INTO users (email, password, role) VALUES (?, ?, ?)").run(
        adminEmail,
        hashed,
        "admin"
    );
    console.log("✔ Admin account created: admin@local / admin123");
} catch {
    console.log("✔ Admin already exists");
}

// Seed products
const products = [
    {
        name: "Fortnite Key",
        description: "Clé Fortnite 1000 V-Bucks instantanée.",
        price: 4.99,
        image: "/assets/products/fortnite.png"
    },
    {
        name: "Steam Wallet 10€",
        description: "Code Steam Wallet utilisable immédiatement.",
        price: 10.00,
        image: "/assets/products/steam.png"
    },
    {
        name: "Discord Nitro",
        description: "Nitro 1 mois activation auto.",
        price: 5.00,
        image: "/assets/products/nitro.png"
    },
    {
        name: "Netflix UHD",
        description: "Compte UHD 1 mois, premium.",
        price: 9.99,
        image: "/assets/products/netflix.png"
    },
    {
        name: "Spotify Premium",
        description: "Compte premium 1 mois.",
        price: 4.99,
        image: "/assets/products/spotify.png"
    },
    {
        name: "VPN Premium",
        description: "VPN 1 mois ultra rapide.",
        price: 2.99,
        image: "/assets/products/vpn.png"
    }
];

const insertProduct = db.prepare(`
    INSERT INTO products (name, description, price, image)
    VALUES (?, ?, ?, ?)
`);

for (const p of products) {
    try {
        insertProduct.run(p.name, p.description, p.price, p.image);
        console.log("✔ Product added:", p.name);
    } catch {
        console.log("✔ Product already exists:", p.name);
    }
}

console.log("✔ Database seeded successfully!");
