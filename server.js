import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3001;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

// Proxy endpoint for API requests
app.get('/api/*', async (req, res) => {
  try {
    const path = req.params[0];
    const url = `https://fantasy.premierleague.com/api/${path}`;

    console.log(`Proxying request to: ${url}`);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      console.error(`API returned status ${response.status} for ${url}`);
      return res.status(response.status).json({ error: 'Failed to fetch from FPL API' });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// Serve built frontend whenever a dist build exists (works across hosts)
const clientBuildPath = path.join(__dirname, 'dist');
const clientIndexPath = path.join(clientBuildPath, 'index.html');
if (fs.existsSync(clientIndexPath)) {
  app.use(express.static(clientBuildPath));

  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API route not found' });
    }
    res.sendFile(clientIndexPath);
  });
}

app.listen(PORT, () => {
  console.log(`FPL Proxy server running on http://localhost:${PORT}`);
});
