"use strict";

var express = require('express');

var bodyParser = require('body-parser');

var routes = require('./routes');

var cors = require('cors');

var cookieParser = require('cookie-parser');

var https = require('https')

var fs = require('fs')

var httpProxy = require('http-proxy');

var helmet = require('helmet'); // Helmet middleware for security headers


var app = express();
var proxy = httpProxy.createProxyServer();
var API_BASE_URL = 'https://sandbox.bluesnap.com';

var crypto = require('crypto');

var port = process.env.PORT || 8443; // CORS configuration

var corsOptions = {
  origin: 'https://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(cookieParser());
app.set('view engine', 'ejs'); // Route to render your HTML template with nonce

app.get('/', function (req, res) {
  var nonce = generateNonce();
  res.render('index', {
    nonce: nonce
  });
}); // Generate nonce

function generateNonce() {
  return crypto.randomBytes(16).toString('base64');
} // Middleware to set CSP headers


app.use(function (req, res, next) {
  var nonce = generateNonce();
  res.locals.nonce = nonce;
  res.setHeader('Content-Security-Policy', "script-src 'self' 'nonce-".concat(nonce, "' *.cardinalcommerce.com *.kaptcha.com *.sentry.io google.com *.google.com *.gstatic.com static.cloudflareinsights.com cdnjs.cloudflare.com; frame-src 'self' sandbox.bluesnap.com sandbox1.bluesnap.com sandbox2.bluesnap.com *.cardinalcommerce.com *.kaptcha.com *.sentry.io google.com *.google.com;"));
  next();
});
app.use('/api', routes);
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
app.use(helmet.contentSecurityPolicy({
  useDefaults: true,
  directives: {
    "script-src": ["'self'", "https://sandbox.bluesnap.com", "https://netfree.link"],
    "object-src": ["'self'"] // Add more directives as needed

  }
}));

const httpsOptions = {
  cert: fs.readFileSync('./localhost_cert.pem'), //where the pem files are?
  key: fs.readFileSync('./localhost_key.pem')   //where the pem files are?
}

https.createServer(httpsOptions,app).listen(port, function () {
  console.log("Server is running on 127.0.0.1 ",port);
});