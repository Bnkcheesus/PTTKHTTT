const express = require('express');
const router = express.Router();
const {
    getPaidDepositsNoContract,
    getApprovedDepositsNoContract,
    getContractList,
    approveDeposit,
    rejectDeposit,
    createContract,
    createBienBan,
    getEquipmentList,
    getBienBanDetails,
    addBienBanDetail,
    removeBienBanDetail,
} = require('../models/hopDongModel');

router.get('/deposits-paid', async (req, res) => {
    try {
        const deposits = await getPaidDepositsNoContract();
        res.json(deposits);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/deposits-approved', async (req, res) => {
    try {
        const deposits = await getApprovedDepositsNoContract();
        res.json(deposits);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/list', async (req, res) => {
    try {
        const contracts = await getContractList();
        res.json(contracts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/deposit/:maPhieu/approve', async (req, res) => {
    try {
        await approveDeposit(req.params.maPhieu);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/deposit/:maPhieu/reject', async (req, res) => {
    try {
        await rejectDeposit(req.params.maPhieu);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        await createContract(req.body);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/:MaHD/bienban', async (req, res) => {
    try {
        const { MaNV } = req.body;
        await createBienBan(req.params.MaHD, MaNV);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/equipment/list', async (req, res) => {
    try {
        const equipment = await getEquipmentList();
        res.json(equipment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:MaHD/bienban/details', async (req, res) => {
    try {
        const details = await getBienBanDetails(req.params.MaHD);
        res.json(details);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/:MaHD/bienban/add-item', async (req, res) => {
    try {
        const { MaTB, SoLuong } = req.body;
        await addBienBanDetail(req.params.MaHD, MaTB, SoLuong);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/:MaHD/bienban/remove-item', async (req, res) => {
    try {
        const { MaTB } = req.body;
        await removeBienBanDetail(req.params.MaHD, MaTB);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
