const express = require('express');
const router = express.Router();
const { LayDanhSachPhong, LayChiTietPhong } = require('../models/roomModel');

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