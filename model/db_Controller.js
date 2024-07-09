const mysql = require('mysql');
const express = require('express');
const router = express.Router();

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

module.exports.signup = (username, email, password, status, callback) => {
    const checkEmailQuery = 'SELECT email FROM users WHERE email = ?';
    connection.query(checkEmailQuery, [email], (err, result) => {
        if (err) return callback(err);

        if (result.length === 0) {
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

module.exports.getVerifyDetails = (id, callback) => {
    const getUserQuery = 'SELECT token, email FROM verify WHERE id = ?';
    connection.query(getUserQuery, [id], callback);
};

module.exports.updateEmailStatus = (email, callback) => {
    const updateStatusQuery = 'UPDATE users SET email_status = "verified" WHERE email = ?';
    connection.query(updateStatusQuery, [email], callback);
};

module.exports.matchToken = (id, token, callback) => {
    const getUserQuery = 'SELECT * FROM verify WHERE id = ? AND token = ?';
    connection.query(getUserQuery, [id, token], callback);
};

// Exporting the router if needed for express routes
module.exports.router = router;
