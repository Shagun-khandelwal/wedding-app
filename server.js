require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cloudStore = require('./api/cloud-store');
const path = require('path');

const app = express();
app.use(bodyParser.json({ limit: '10mb' }));

// Enable CORS for all routes
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Serve static files (HTML, CSS, JS) from the current directory
app.use(express.static(path.join(__dirname)));

// Serve index.html for the root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/health', async (req, res) => {
  try {
    const cloudStore = require('./api/cloud-store');
    // Try to get a document to verify connection
    res.json({ status: 'ok', message: 'MongoDB connection working' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.all('/api/cloud-store', async (req, res) => {
  try {
    // Delegate to the Vercel-style handler implemented in `api/cloud-store.js`
    await cloudStore(req, res);
  } catch (err) {
    console.error('handler error', err);
    res.status(500).json({ error: err.message || 'internal' });
  }
});

app.options('/api/cloud-store', (req, res) => res.sendStatus(204));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Dev server listening: http://localhost:${port}`));

module.exports = app;
