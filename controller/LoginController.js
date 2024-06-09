const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const db = require('../model/db_Controller.js');
const session = require('express-session');
const { check, validationResult } = require('express-validator');
require('dotenv').config();

const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'hms'
});

connection.connect((err) => {
    if (err) {
        throw err;
    } else {
        console.log('Connected to database successfully');
    }
});

router.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 60000 } // Cookie expiration time
}));

// Middleware
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.post('/',
    [
        check('username').notEmpty().withMessage('Username is required'),
        check('password').notEmpty().withMessage('Password is required'),
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        const { username, password } = req.body;

        const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
        connection.query(query, [username, password], (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Database error', error: err.message });
            }

            if (results.length > 0) {
                req.session.loggedin = true;
                req.session.username = username;
                return res.status(200).json({ message: 'Login successful', redirect: '/home' });
            } else {
                return res.status(401).json({ message: 'Incorrect Username and/or Password' });
            }
        });
    }
);

module.exports = router;
