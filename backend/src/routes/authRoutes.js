const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { getEmployeeByMaNV } = require('../models/authModel');

// New login route with username
router.post('/login', authController.login);

// Legacy route - keep for backward compatibility
router.post('/validate', async (req, res) => {
    try {
        const { MaNV } = req.body;

        if (!MaNV) {
            return res.status(400).json({ error: 'MaNV is required' });
        }

        const employee = await getEmployeeByMaNV(MaNV);

        if (!employee) {
            return res.status(401).json({ error: 'Invalid employee ID' });
        }

        // Return employee info and role
        res.json({
            MaNV: employee.MaNV,
            TenNV: employee.TenNV,
            Role: employee.Role,
            token: Buffer.from(`${employee.MaNV}:${employee.Role}`).toString('base64')
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

