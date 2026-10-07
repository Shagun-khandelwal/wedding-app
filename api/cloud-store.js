const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'wedding_app';
const COLLECTION = process.env.COLLECTION_NAME || 'store';
const STORE_ID = 'entries';

let cachedClient = null;

async function getClient() {
  if (cachedClient && cachedClient.topology && cachedClient.topology.isConnected()) return cachedClient;
  if (!MONGODB_URI) throw new Error('MONGODB_URI not set');
  const client = new MongoClient(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect();
  cachedClient = client;
  return client;
}

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = async (req, res) => {
  try {
    setCors(res);
    if (req.method === 'OPTIONS') return res.status(204).end();

    const client = await getClient();
    const db = client.db(DB_NAME);
    const col = db.collection(COLLECTION);

    if (req.method === 'GET') {
      const doc = await col.findOne({ _id: STORE_ID });
      const data = doc && Array.isArray(doc.data) ? doc.data : [];
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const body = req.body;
      // Accept raw JSON array or object containing `data`.
      const incoming = Array.isArray(body) ? body : (body && Array.isArray(body.data) ? body.data : null);
      if (!incoming) return res.status(400).json({ error: 'Expected JSON array in request body or {"data": [...] }' });

      const now = new Date();
      await col.updateOne(
        { _id: STORE_ID },
        { $set: { data: incoming, updatedAt: now } },
        { upsert: true }
      );

      // Optionally write an audit record
      try {
        const auditCol = db.collection('audit');
        await auditCol.insertOne({ action: 'replace', timestamp: now, count: incoming.length });
      } catch (e) {
        // ignore audit errors
      }

      return res.status(200).json({ ok: true, updatedAt: now.toISOString(), count: incoming.length });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('cloud-store error', err);
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
};
