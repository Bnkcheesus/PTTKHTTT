const express = require('express');
const router = express.Router();
const {
    getAllCustomers,
    getCustomerById,
    searchCustomers,
    ThemKH,
    ThemPYC,
    ThemNhom,
    ThemCTNhom,
    LayThongTinKH,
    registerGroupFlow
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

router.post('/register-flow', async (req, res) => {
    try {
        // 1. Tạo khách hàng trước để lấy MaKH tự động
        const maKH = await ThemKH(req.body.customerInfo);
        
        // 2. Dùng MaKH đó để tạo Phiếu yêu cầu
        const pycData = { ...req.body.requestInfo, MaKH: maKH };
        const maPYC = await ThemPYC(pycData);

        res.json({ success: true, MaKH: maKH, MaPYC: maPYC });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/check-cccd/:cccd', async (req, res) => {
    try {
        const customer = await LayThongTinKH(req.params.cccd);
        res.json({ exists: !!customer, data: customer });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/register-group-flow', async (req, res) => {
    try {
        const { daiDienInfo, khachPhuList, requestInfo } = req.body;
        const result = await registerGroupFlow(daiDienInfo, khachPhuList, requestInfo);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
