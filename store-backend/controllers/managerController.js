const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const managerModel = require('../models/managerModel');

async function login(req, res) {
    try {
        const { username, password } = req.body || {};

        if (typeof username !== 'string' || typeof password !== 'string' || !username.trim() || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        const manager = await managerModel.findByUsername(username.trim());

        if (!manager) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const passwordMatches = await bcrypt.compare(password, manager.password);
        if (!passwordMatches) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const token = jwt.sign(
            { id: manager._id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({ token });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = {
    login,
};
