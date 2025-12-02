# SellLite — Version B (SQLite + Admin) — Example project

## Quickstart
1. npm install
2. Copy .env.example -> .env and fill keys
3. npm run dev
4. Open http://localhost:3000

Notes:
- Webhooks require public reachable endpoints (use ngrok for dev).
- Auto-delivery: when Stripe or Coinbase confirms payment, server marks order paid and inserts a generated key into delivered_keys.
