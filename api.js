const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const httpProxy = require('http-proxy');

const app = express();
const proxy = httpProxy.createProxyServer();
const API_BASE_URL = 'https://sandbox.bluesnap.com';

const port = process.env.PORT || 8080;

// CORS configuration
const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(cookieParser());

// Middleware to set a cookie
app.use((req, res, next) => {
    res.cookie('exampleCookie', 'cookieValue', {
        httpOnly: true,
        secure: true,
        sameSite: 'Lax'
    });
    next();
});
app.use('/', (req, res) => {
    proxy.web(req, res, {
        target: API_BASE_URL,
        changeOrigin: true, 
        headers: {
            'Host': 'sandbox.bluesnap.com',
            // Additional headers as needed
        }
        , secure: false

    });
});
// Routes
app.use('/api', routes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
