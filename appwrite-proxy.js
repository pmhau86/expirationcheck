import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3002;

// Enable CORS for all routes
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://192.168.10.239:5173',
    'http://127.0.0.1:5173'
  ],
  credentials: true
}));

app.use(express.json());

// Proxy all requests to Appwrite MCP
app.use('/appwrite', async (req, res) => {
  try {
    const targetUrl = `http://192.168.10.32:8080/v1${req.path.replace('/appwrite', '')}`;
    
    console.log(`🔄 Proxying: ${req.method} ${req.path} -> ${targetUrl}`);
    
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        ...req.headers
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
    });

    const data = await response.json();
    
    console.log(`✅ Response: ${response.status} for ${req.path}`);
    
    // Add CORS headers to bypass the issue
    res.setHeader('Access-Control-Allow-Origin', 'http://192.168.10.239:5173');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    res.status(response.status).json(data);
    
  } catch (error) {
    console.error(`❌ Proxy error for ${req.path}:`, error.message);
    res.status(500).json({ error: 'Proxy error', message: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Appwrite Proxy Server is running',
    target: 'http://192.168.10.32:8080'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Appwrite Proxy Server running on http://0.0.0.0:${PORT}`);
  console.log(`📡 Proxy endpoint: http://0.0.0.0:${PORT}/appwrite/*`);
  console.log(`🎯 Target: http://192.168.10.32:8080`);
  console.log(`🌐 Access from your IP: http://192.168.10.239:${PORT}`);
});
