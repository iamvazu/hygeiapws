/**
 * Vercel Serverless Reverse Proxy to Hostinger VPS Backend
 * Forwards all /api/* requests to http://2.25.90.226/api/*
 */

const http = require('http');

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Extract path
  const targetUrl = `http://2.25.90.226${req.url}`;

  try {
    const urlObj = new URL(targetUrl);
    
    const options = {
      hostname: urlObj.hostname,
      port: 80,
      path: urlObj.pathname + urlObj.search,
      method: req.method,
      headers: {
        ...req.headers,
        host: urlObj.hostname
      }
    };

    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    proxyReq.on('error', (err) => {
      console.error('VPS Proxy Error:', err);
      res.status(502).json({ error: 'Backend server connection error', details: err.message });
    });

    if (req.body) {
      const bodyData = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      proxyReq.write(bodyData);
    }

    proxyReq.end();
  } catch (err) {
    console.error('Proxy Handler Error:', err);
    res.status(500).json({ error: 'Internal proxy error', details: err.message });
  }
};
