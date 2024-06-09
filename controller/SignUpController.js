const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const db = require('../model/db_Controller.js');
const nodemailer = require('nodemailer');
const randomToken = require('random-token');
const { check, validationResult } = require('express-validator');
require('dotenv').config(); // Load environment variables

// Middleware
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

// Validation and Signup Route
router.post(
    '/',
    [
        check('username').notEmpty().withMessage('Username is required'),
        check('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format'),
        check('password').notEmpty().withMessage('Password is required'),
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        const { username, email, password } = req.body;
        const email_status = "not verified";

        // Signup and verification process
        db.signup(username, email, password, email_status, (err) => {
            if (err) {
                return res.status(500).send(err.message);
            }

            const token = randomToken(8);
            db.verify(username, email, token, (err) => {
                if (err) {
                    return res.status(500).send(err.message);
                }

                db.getuserid(email, (err, result) => {
                    if (err) {
                        return res.status(500).send(err.message);
                    }

                    const id = result[0].id;
                    const output = `<p>Dear ${username},</p>
                        <p>Thank you. Your verification ID and token are given below:</p>
                        <ul>
                            <li>User ID: ${id}</li>
                            <li>Token: ${token}</li>
                        </ul>
                        <p>Verify Link: <a href="http://localhost:4000/verify">Verify</a></p>
                        <strong>AUTO GENERATED, DON'T REPLY</strong>`;

                    // Send email logic (configure nodemailer)
                    const transporter = nodemailer.createTransport({
                        service: 'Gmail',
                        auth: {
                            user: process.env.EMAIL_USER,
                            pass: process.env.EMAIL_PASS
                        }
                    });

                    const mailOptions = {
                        from: process.env.EMAIL_USER,
                        to: email,
                        subject: 'Verification Email',
                        html: output
                    };

                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            return res.status(500).send(error.message);
                        }
                        res.status(200).send('Signup successful and verification email sent');
                        console.log(info);
                    });
                });
            });
        });
    }
);

module.exports = router;
