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
    LayThongTinKH
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
        // 1. Tạo Khách đại diện
        const maKHDaiDien = await ThemKH(req.body.daiDienInfo);
        
        // 2. Tạo Nhóm thuê (Lấy mã đại diện)
        const maNhom = await ThemNhom(maKHDaiDien);

        // 3. Lặp qua mảng khách phụ để tạo KH và nhét vào Nhóm
        if (req.body.khachPhuList && req.body.khachPhuList.length > 0) {
            for (let khPhu of req.body.khachPhuList) {
                const maKHPhu = await ThemKH(khPhu); // Tạo khách phụ
                await ThemCTNhom(maNhom, maKHPhu);   // Nhét vào chi tiết nhóm
            }
        }

        // 4. Tạo Phiếu Yêu Cầu (Gắn với khách đại diện)
        const pycData = { ...req.body.requestInfo, MaKH: maKHDaiDien };
        const maPYC = await ThemPYC(pycData);

        res.json({ success: true, MaNhom: maNhom, MaPYC: maPYC });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
