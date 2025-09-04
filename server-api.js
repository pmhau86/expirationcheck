import express from 'express';
import cors from 'cors';
import tls from 'tls';
import fetch from 'node-fetch';
import 'dotenv/config';

const app = express();
const PORT = 3001;
const HOST = '0.0.0.0'; // Bind to all network interfaces

// Enable CORS for all routes with specific origin
app.use(cors({
  origin: ['http://localhost:5173', 'http://' + process.env.MY_IP + ':5173'],
  credentials: true
}));
app.use(express.json());

// SSL Certificate check function using Node.js tls module
function checkSSLExpire(host, port = 443) {
  return new Promise((resolve, reject) => {
    const socket = tls.connect(port, host, {
      servername: host,
      rejectUnauthorized: false // Allow expired certificates
    }, () => {
      const cert = socket.getPeerCertificate();
      if (!cert || !cert.valid_to) {
        reject("Không lấy được chứng chỉ");
      } else {
        const now = new Date();
        const validTo = new Date(cert.valid_to);
        const isExpired = validTo < now;

        resolve({
          domain: host,
          valid_from: cert.valid_from,
          valid_to: cert.valid_to,
          issuer: cert.issuer?.CN || 'Unknown',
          subject: cert.subject?.CN || host,
          isExpired: isExpired,
          daysUntilExpiry: isExpired ?
            Math.floor((validTo - now) / (1000 * 60 * 60 * 24)) :
            Math.floor((validTo - now) / (1000 * 60 * 60 * 24))
        });
      }
      socket.end();
    });

    socket.on("error", (err) => {
      // Handle specific SSL errors
      if (err.code === 'CERT_HAS_EXPIRED') {
        // Try to get certificate info even if expired
        const cert = socket.getPeerCertificate();
        if (cert && cert.valid_to) {
          resolve({
            domain: host,
            valid_from: cert.valid_from,
            valid_to: cert.valid_to,
            issuer: cert.issuer?.CN || 'Unknown',
            subject: cert.subject?.CN || host,
            isExpired: true,
            daysUntilExpiry: Math.floor((new Date(cert.valid_to) - new Date()) / (1000 * 60 * 60 * 24))
          });
        } else {
          reject("Certificate expired and no valid information available");
        }
      } else if (err.code === 'ENOTFOUND') {
        reject("Domain not found");
      } else if (err.code === 'ECONNREFUSED') {
        reject("Connection refused");
      } else if (err.code === 'ETIMEDOUT') {
        reject("Connection timeout");
      } else {
        reject(err.message || "SSL connection failed");
      }
    });

    // Add timeout
    socket.setTimeout(10000, () => {
      socket.destroy();
      reject("Timeout - Không thể kết nối");
    });
  });
}

// SSL Certificate check endpoint
app.get('/api/ssl-check/:domain', async (req, res) => {
  try {
    const { domain } = req.params;
    console.log(`🔍 Checking SSL certificate for: ${domain}`);

    const sslInfo = await checkSSLExpire(domain);

    console.log(`✅ SSL certificate found for ${domain}:`, sslInfo);

    const result = {
      domain: sslInfo.domain,
      validTo: new Date(sslInfo.valid_to).toISOString(),
      validFrom: new Date(sslInfo.valid_from).toISOString(),
      issuer: sslInfo.issuer,
      subject: sslInfo.subject,
      isExpired: sslInfo.isExpired,
      daysUntilExpiry: sslInfo.daysUntilExpiry,
      success: true
    };

    res.json(result);

  } catch (error) {
    console.error(`❌ SSL check failed for ${req.params.domain}:`, error.message);

    res.status(500).json({
      domain: req.params.domain,
      error: error.message,
      success: false
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'SSL Check API Server is running' });
});

// Test endpoint
app.get('/test/:domain', async (req, res) => {
  try {
    const { domain } = req.params;
    console.log(`🧪 Testing SSL check for: ${domain}`);

    const sslInfo = await checkSSLExpire(domain);

    res.json({
      message: 'Test successful',
      data: sslInfo
    });

  } catch (error) {
    res.status(500).json({
      message: 'Test failed',
      error: error.message
    });
  }
});

// Appwrite proxy endpoint
app.use('/appwrite', async (req, res) => {
  try {
    const path = req.path.replace('/appwrite', '');
    const appwriteUrl = `http://192.168.10.32:8080/v1${path}`;
    console.log(`🔄 Proxying to Appwrite: ${req.method} ${appwriteUrl}`);

    const fetchOptions = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': '68b16e260029530463c0',
        'X-Appwrite-Key': process.env.APPWRITE_API_KEY || ''
      }
    };

    // Only add body for non-GET requests and when body exists
    if (req.method !== 'GET' && req.body && Object.keys(req.body).length > 0) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const response = await fetch(appwriteUrl, fetchOptions);

    // Handle different response types
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    console.log(`✅ Appwrite response: ${response.status}`);
    res.status(response.status).json(data);

  } catch (error) {
    console.error('❌ Appwrite proxy error:', error);
    res.status(500).json({ error: 'Proxy error', message: error.message });
  }
});

app.listen(PORT, HOST, () => {
  console.log(`🚀 SSL Check API Server running on http://${HOST}:${PORT}`);
  console.log(`📡 SSL check endpoint: http://${HOST}:${PORT}/api/ssl-check/:domain`);
  console.log(`🧪 Test endpoint: http://${HOST}:${PORT}/test/:domain`);
  console.log(`🌐 Access from your IP: http://${process.env.MY_IP}:${PORT}`);
});
