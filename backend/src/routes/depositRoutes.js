const express = require('express');
const router = express.Router();
const depositController = require('../controllers/depositController');

const { getCustomerByCCCD } = require('../models/customerModel');
const { LayPhieuYeuCauGanNhat } = require('../models/xacNhanThueModel');
const {
    LayThongTinPhong,
    getFreeBedsByMaPhong,
    CapNhatTrangThaiGiuong,
    CapNhatTrangThaiPhong
} = require('../models/roomModel');
const {
    LayPhieuDatCocTheoMaPhieuYC,
    GhiNhanThanhToan,
    DatGiuong,
    TaoLichHenNhanPhong
} = require('../models/depositModel');
const { route } = require('./xacNhanThueRoutes');

router.get('/paid', depositController.getPaid);
router.get('/approved', depositController.getApproved);
router.post('/approve/:id', depositController.approve);
router.post('/reject/:id', depositController.reject);
router.get('/pending-payments', depositController.getPendingPayments);
router.get('/pending/:cccd', depositController.getPendingRequest);
router.post('/cancel/:id', depositController.cancelDeposit);
router.post('/confirm', depositController.confirmRental);
router.get('/info/:cccd', depositController.getDepositInfo);
router.post('/pay', depositController.processPayment);
router.post('/update-customer', depositController.updateCustomer);

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
            trangThaiPYC,
            phieuDatCoc
        });
    } catch (err) {
        res.status(500).send('Lỗi server rồi: ' + err.message);
    }
});

router.post('/record-payment', async (req, res) => {
    try {
        const { MaPhieuDatCoc, HinhThucThanhToan, MaPhong, SoNguoi, HinhThucThue } = req.body;
        
        // 1. Kiểm tra giường trước
        const beds = await getFreeBedsByMaPhong(MaPhong);
        if (beds.length < SoNguoi) {
            return res.status(400).json({ error: 'Không đủ giường trống trong phòng!' });
        }

        // 2. Ghi nhận tiền
        await GhiNhanThanhToan(MaPhieuDatCoc, HinhThucThanhToan);

        // 3. Đặt giường cho khách
        for (let i = 0; i < SoNguoi; i++) {
            await DatGiuong(MaPhieuDatCoc, beds[i].MaGiuong);
            await CapNhatTrangThaiGiuong(beds[i].MaGiuong, 'Đã có người'); 
        }

        // 4. CHỈ CẬP NHẬT PHÒNG NẾU THUÊ NGUYÊN PHÒNG
        if (HinhThucThue && HinhThucThue.toLowerCase().includes('nguyên')) {
            await CapNhatTrangThaiPhong(MaPhong, 'Đã đặt cọc');
        }

        res.json({ message: 'Thanh toán đã được ghi nhận!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// file: depositRoutes.js
router.post('/appointment', async (req, res) => {
    try {
        // 1. Lấy thêm MaNV từ body
        const { MaPhieuYC, NgayHen, GioHen, MaNV } = req.body; 
        
        // 2. Format chuỗi thời gian
        const ngayGioHen = `${NgayHen} ${GioHen}:00`; 
        
        // 3. TRUYỀN ĐỦ 3 THAM SỐ: ngayGioHen, MaPhieuYC, MaNV
        const maLH = await TaoLichHenNhanPhong(ngayGioHen, MaPhieuYC, MaNV);
        
        res.json({ message: 'Lịch hẹn đã được tạo!', MaLichHen: maLH });
    } catch (err) {
        res.status(500).send('Lỗi server: ' + err.message);
    }
});

module.exports = router;