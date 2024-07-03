const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const httpProxy = require('http-proxy');
const helmet = require('helmet'); // Helmet middleware for security headers
const https = require('https'); // Require HTTPS module
const fs = require('fs'); // Require File System module
const crypto = require('crypto');

const app = express();
const proxy = httpProxy.createProxyServer();
const API_BASE_URL = 'https://sandbox.bluesnap.com';


const port = process.env.PORT || 443;

// CORS configuration
const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
const options = {
  key: fs.readFileSync('./key.pem'),
  cert: fs.readFileSync('./cert.pem'),
  
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(cookieParser());
app.set('view engine', 'ejs');

// Route to render your HTML template with nonce
app.get('/', (req, res) => {
  const nonce = generateNonce();
  res.render('index', { nonce });
});

// Generate nonce
function generateNonce() {
  return crypto.randomBytes(16).toString('base64');
}

// Middleware to set CSP headers
app.use((req, res, next) => {
  const nonce = generateNonce();
  res.locals.nonce = nonce;
  res.setHeader(
    'Content-Security-Policy',
    `script-src 'self' 'nonce-${nonce}' *.cardinalcommerce.com *.kaptcha.com *.sentry.io google.com *.google.com *.gstatic.com static.cloudflareinsights.com cdnjs.cloudflare.com; frame-src 'self' sandbox.bluesnap.com sandbox1.bluesnap.com sandbox2.bluesnap.com *.cardinalcommerce.com *.kaptcha.com *.sentry.io google.com *.google.com;`
  );
  next();
});

app.use('/api', routes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.use(
    helmet.contentSecurityPolicy({
      useDefaults: true,
      directives: {
        "script-src": ["'self'", "https://sandbox.bluesnap.com", "https://netfree.link"],
        "object-src": ["'self'"],
        // Add more directives as needed
      },
    })
  );

// Start HTTPS server
https.createServer(options, app).listen(port, () => {
    console.log(`Server is running on port ${port}`);
});



