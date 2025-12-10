import express from "express";
import session from "express-session";
import BetterSqliteStore from "better-sqlite3-session-store";
import path from "path";
import cors from "cors";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

// Fix pour __dirname sous ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../public")));

// Session store SQLite moderne
app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecret",
    resave: false,
    saveUninitialized: false,
    store: new BetterSqliteStore({
      client: "better-sqlite3",
      expired: {
        clear: true,
        intervalMs: 900000, // 15 min auto cleanup
      },
      path: "./database/sessions.db",
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 jours
    },
  })
);

// === Routes ===

// Page d'accueil
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Exemple login admin
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "admin123") {
    req.session.admin = true;
    return res.json({ success: true });
  }

  res.json({ success: false, message: "Invalid credentials" });
});

// Vérification session
app.get("/api/admin/check", (req, res) => {
  res.json({ admin: !!req.session.admin });
});

// Démarre le serveur
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
