const express = require('express');
const router = express.Router();
const { getEmployeeByMaNV } = require('../models/authModel');

router.post('/login', async (req, res) => {
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
