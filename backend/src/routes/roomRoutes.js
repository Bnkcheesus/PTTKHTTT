const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { LayDanhSachPhong, LayChiTietPhong } = require('../models/roomModel');

router.get('/inspection/list', roomController.getInspectionCandidates);
router.get('/inspection/:MaPhieuTra', roomController.getHandoverInfo);
router.post('/inspection', roomController.createInspectionVoucher);
router.post('/inspection/:MaPhieuKiemTra/details', roomController.addInspectionDetail);

router.get('/', async (req, res) => {
    try {
        const rooms = await LayDanhSachPhong();
        res.json(rooms);
    } catch (err) {
        res.status(500).send('Lỗi server rồi: ' + err.message);
    }
});

router.get('/:MaPhong', async (req, res) => {
    try {
        const room = await LayChiTietPhong(req.params.MaPhong);
        if (!room) {
            return res.status(404).json({ error: 'Không tìm thấy phòng này!' });
        }
        res.json(room);
    } catch (err) {
        res.status(500).send('Lỗi server rồi: ' + err.message);
    }
});

module.exports = router;