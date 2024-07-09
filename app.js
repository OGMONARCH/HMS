require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
const http = require('http');
const ejs = require('ejs');
const multer = require('multer');
const async = require('async');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { check, validationResult } = require('express-validator');
const sweetalert = require('sweetalert2');

const signup = require('./controller/SignUpController');
const login = require('./controller/LoginController');
const verify = require('./controller/VerificationController');
const db = require('./model/db_Controller');




const app = express();
const server = http.createServer(app);

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Static files middleware
app.use(express.static(path.join(__dirname, 'public')));

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Cookie parser middleware
app.use(cookieParser());

// Session middleware
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 } // Set cookie expiration time
}));

// Routes
app.use('/signup', signup);
app.use('/login', login);
app.use('/verify', verify); 

app.get('/home', (req, res) => {
    if (req.session.loggedin) {
        res.render('home', { username: req.session.username });
    } else {
        res.redirect('/login');
    }
});

// Start the server
const PORT = process.env.PORT ;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
