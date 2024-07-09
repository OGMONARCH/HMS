const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const db = require('../model/db_Controller.js');
const { check, validationResult } = require('express-validator');

// Middleware
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

// Validation and Verification Route
router.post(
    '/',
    [
        check('id').notEmpty().withMessage('ID is required'),
        check('token').notEmpty().withMessage('Token is required'),
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        const { id, token } = req.body;

        db.matchtoken(id, token, (err, result) => {
            if (err) {
                return res.status(500).send(err.message);
            }

            if (result.length > 0) {
                const email = result[0].email;
                db.updateEmailStatus(email, (err, updateResult) => {
                    if (err) {
                        return res.status(500).send(err.message);
                    }
                    res.status(200).send("Email verified successfully");
                });
            } else {
                res.status(400).send("Invalid token or ID");
            }
        });
    }
);

module.exports = router;
