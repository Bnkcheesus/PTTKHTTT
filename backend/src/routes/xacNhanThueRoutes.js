const express = require('express');
const router = express.Router();
const {
    LayPhieuYeuCauGanNhat,
    CapNhatTrangThaiPYC

 } = require('../models/xacNhanThueModel');
const { getCustomerByCCCD } = require('../models/customerModel');
const { LayThongTinPhong } = require('../models/roomModel');
const { LayPhieuDatCocTheoMaPhieuYC, createDeposit } = require('../models/depositModel');

router.get('/:cccd', async (req, res) => {
    try {
        const cccd = req.params.cccd;
        console.log('CCCD nhận được:', cccd); // Debug log
        // Add logic to fetch customer data based on CCCD
        const khachHang = await getCustomerByCCCD(cccd);
        if (!khachHang) {
            return res.status(404).json({ error: 'Không tìm thấy khách hàng này!' });
        }
        const maKH = khachHang.MaKH;
        console.log('Mã khách hàng:', maKH); // Debug log
        const phieuYeuCau = await LayPhieuYeuCauGanNhat(maKH);
        if (!phieuYeuCau) {
            return res.status(404).json({ error: 'Không tìm thấy phiếu yêu cầu nào cho khách hàng này!' });
        }
        const maPhong = phieuYeuCau.MaPhong;
        console.log('Mã phòng:', maPhong); // Debug log
        const phong = await LayThongTinPhong(maPhong);
        const maPhieuYC = phieuYeuCau.MaPhieuYC;
        console.log('Mã phiếu yêu cầu:', maPhieuYC); // Debug log
        const phieuDatCoc = await LayPhieuDatCocTheoMaPhieuYC(maPhieuYC);
        console.log('Phiếu đặt cọc:', phieuDatCoc); // Debug log
        const trangThaiPYC = !phieuDatCoc ? 'Chưa xác nhận' : 'Đã xác nhận';
        res.json({
            khachHang,
            phieuYeuCau,
            phong,
            trangThaiPYC
        });
    } catch (err) {
        res.status(500).send('Lỗi server rồi: ' + err.message);
    }
});

router.post('/confirm', async (req, res) => {
    try {
        const { TienCoc, MaKH, MaNV, MaPhong, MaPhieuYC } = req.body;
        console.log('Dữ liệu nhận được để xác nhận:', req.body); // Debug log
        // Add logic to confirm the rental request and update the database
        // For example, you might want to update the status of the rental request and the room
        const maPDC = await createDeposit(TienCoc, MaKH, MaNV, MaPhong, MaPhieuYC);
        res.json({ message: 'Xác nhận thành công!', MaPhieuDatCoc: maPDC });
    } catch (err) {
        res.status(500).send('Lỗi server rồi: ' + err.message);
    }
});

module.exports = router;