const mysql = require('mysql');
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');

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
        console.log('connected to database successfully');
    }
});

module.exports.signup = (username, email, password, status, callback) => {
    const checkEmailQuery = 'SELECT email FROM users WHERE email = ?';
    connection.query(checkEmailQuery, [email], (err, result) => {
        if (err) return callback(err);

        if (result[0] == undefined) {
            const insertUserQuery = 'INSERT INTO users (username, email, password, email_status) VALUES (?, ?, ?, ?)';
            connection.query(insertUserQuery, [username, email, password, status], callback);
        } else {
            callback(new Error("Email already exists"));
        }
    });
};

module.exports.verify = (username, email, token, callback) => {
    const insertVerifyQuery = 'INSERT INTO verify (username, email, token) VALUES (?, ?, ?)';
    connection.query(insertVerifyQuery, [username, email, token], callback);
};

module.exports.getuserid = (email, callback) => {
    const getUserQuery = 'SELECT * FROM verify WHERE email = ?';
    connection.query(getUserQuery, [email], callback);
};

// Exporting the router if needed for express routes
module.exports.router = router;
