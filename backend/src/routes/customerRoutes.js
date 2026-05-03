const express = require('express');
const router = express.Router();
const {
    getAllCustomers,
    getCustomerById,
    searchCustomers,
} = require('../models/customerModel');

router.get('/list', async (req, res) => {
    try {
        const customers = await getAllCustomers();
        res.json(customers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:MaKH', async (req, res) => {
    try {
        const customer = await getCustomerById(req.params.MaKH);
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        res.json(customer);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/search/:term', async (req, res) => {
    try {
        const customers = await searchCustomers(req.params.term);
        res.json(customers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
