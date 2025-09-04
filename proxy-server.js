const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors());

// SSL Labs API proxy endpoint
app.get('/api/ssl-labs/:domain', async (req, res) => {
  try {
    const { domain } = req.params;
    console.log(`🔍 Proxying SSL Labs request for: ${domain}`);
    
    const response = await fetch(`https://api.ssllabs.com/api/v3/analyze?host=${domain}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`SSL Labs API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ SSL Labs response for ${domain}:`, data);
    
    res.json(data);
  } catch (error) {
    console.error(`❌ Proxy error for ${req.params.domain}:`, error.message);
    res.status(500).json({ 
      error: error.message,
      status: 'ERROR',
      statusMessage: 'Proxy server error'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'SSL Labs Proxy Server is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 SSL Labs Proxy Server running on http://localhost:${PORT}`);
  console.log(`📡 Proxy endpoint: http://localhost:${PORT}/api/ssl-labs/:domain`);
});

