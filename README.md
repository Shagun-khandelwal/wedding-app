# Wedding App - Minimal Backend (Vercel + MongoDB Atlas)

This scaffolds a tiny serverless endpoint to store and retrieve the single shared dataset used by your existing HTML frontend.

Files:
- `api/cloud-store.js` — Vercel serverless function implementing GET and POST for the full array.

Environment variables (set these in Vercel or locally):
- `MONGODB_URI` — your MongoDB Atlas connection string
- `DB_NAME` — optional, default `wedding_app`
- `COLLECTION_NAME` — optional, default `store`
- `SYNC_SECRET` — optional short secret; if set the endpoint requires the `x-sync-secret` header

Deploy to Vercel:

1. Create a MongoDB Atlas free-tier cluster and get the connection string.
2. Create a new Vercel project from this repo (or import from GitHub).
3. In Vercel project settings add the environment variables from `.env.example`.
4. Deploy — Vercel will expose `https://<your-deploy>.vercel.app/api/cloud-store`.

Local development and testing:

1. Copy `.env.example` to `.env` and fill `MONGODB_URI` (and optional `SYNC_SECRET`).
2. Install dependencies:

```bash
npm install
```

3. Run the local dev server:

```bash
npm run dev
```

4. Test the endpoint locally:

```bash
# GET current data
curl -s http://localhost:3000/api/cloud-store | jq .

# Replace dataset with sample.json
curl -X POST -H "Content-Type: application/json" -d @sample.json http://localhost:3000/api/cloud-store

# If SYNC_SECRET is set, include header:
curl -X POST -H "Content-Type: application/json" -H "x-sync-secret: YOUR_SECRET" -d @sample.json http://localhost:3000/api/cloud-store
```

Notes:
- This keeps the current frontend's "whole-array POST/GET" behavior, so your HTML needs only to set `CLOUD_STORE_URL` to the deployed endpoint.
- Concurrent edits may overwrite each other because POST replaces the entire dataset. Consider migrating to per-record CRUD later for safer concurrency.

Quick deploy tips:

- In Vercel, set `MONGODB_URI` and `SYNC_SECRET` (optional) under Project Settings → Environment Variables.
- Use the same `CLOUD_STORE_URL` value in your HTML (point it at `https://<your-deploy>.vercel.app/api/cloud-store`).

If you want, I can now deploy this to Vercel for you and walk through connecting MongoDB Atlas, or I can convert the API to per-record CRUD endpoints next.
