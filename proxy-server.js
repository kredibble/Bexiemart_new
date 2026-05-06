const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 3000;

app.use(
  '/api',
  createProxyMiddleware({
    target: 'https://api.bexiemart.com',
    changeOrigin: true,
    secure: true,
  }),
);

app.listen(PORT, () => {
  console.log(`✅ CORS proxy running on http://localhost:${PORT}`);
});
