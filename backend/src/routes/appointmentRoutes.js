const express = require('express');
const router = express.Router();
const { 
    LayDSKhachChuaHen, 
    KiemTraTrungLich, 
    ThemLichHen,
    LayChiTietPYCTuMaKH
} = require('../models/appointmentModel');

// Lấy danh sách khách chưa có lịch hẹn
router.get('/pending', async (req, res) => {
    try {
        const requests = await LayDSKhachChuaHen();
        res.json(requests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Chốt lịch hẹn (có kiểm tra trùng lịch)
router.post('/schedule', async (req, res) => {
    const { ThoiGian, MaNV, LyDo, MaPhieuYC } = req.body;
    try {
        // Kiểm tra dữ liệu đầu vào
        if(!ThoiGian || !MaNV || !MaPhieuYC) {
            return res.status(400).json({ error: "Thiếu dữ liệu đầu vào!" });
        }

        const isCollision = await KiemTraTrungLich(ThoiGian, MaNV);
        if (isCollision) {
            return res.status(400).json({ error: 'Nhân viên đã có lịch hẹn vào giờ này.' });
        }

        const maLH = await ThemLichHen({ ThoiGian, LyDo, MaPhieuYC, MaNV });
        res.status(201).json({ success: true, MaLH: maLH });
    } catch (err) {
        console.error("Lỗi Server:", err.message); // In lỗi ra Terminal để bác soi
        res.status(500).json({ error: err.message });
    }
});

router.get('/request-details/:MaKH', async (req, res) => {
    try {
        const details = await LayChiTietPYCTuMaKH(req.params.MaKH);
        if (!details) {
            return res.status(404).json({ error: 'Khách hàng này chưa có Phiếu yêu cầu!' });
        }
        res.json(details);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;