const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();

app.use(cors({
    origin: 'http://localhost:3000', // Your React app's address
    credentials: true // Enable sending cookies
  }));
  app.use(bodyParser.json());
app.use(cookieParser());

const port = process.env.PORT || 8080;

// Middleware to set a cookie
app.use((req, res, next) => {
    res.cookie('exampleCookie', 'cookieValue', {
        httpOnly: true,    // Helps prevent cross-site scripting (XSS)
        secure: true,      // Ensures the browser only sends the cookie over HTTPS
        sameSite: 'Lax'    // Can be 'Lax', 'Strict', or 'None'
    });
    next();
});

app.use('/api', routes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
