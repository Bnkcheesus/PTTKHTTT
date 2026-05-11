const express = require('express');
const router = express.Router();
const depositController = require('../controllers/depositController');

const { getCustomerByCCCD } = require('../models/customerModel');
const { LayPhieuYeuCauGanNhat } = require('../models/xacNhanThueModel');
const {
    LayThongTinPhong,
    getFreeBedsByMaPhong,
    CapNhatTrangThaiGiuong
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
router.get('/pending/:cccd', depositController.getPendingRequest);
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
        const { MaPhieuDatCoc, HinhThucThanhToan, MaPhong, SoNguoi } = req.body;
        console.log('Dữ liệu nhận được để ghi nhận thanh toán:', req.body);
        await GhiNhanThanhToan(MaPhieuDatCoc, HinhThucThanhToan);
        const beds = await getFreeBedsByMaPhong(MaPhong);
        console.log('Giường trống trong phòng:', beds);
        if (beds.length < SoNguoi) {
            return res.status(400).json({ error: 'Không đủ giường trống trong phòng để ghi nhận thanh toán!' });
        }
        for (let i = 0; i < SoNguoi; i++) {
            console.log(`Đang đặt giường ${beds[i].MaGiuong} cho phiếu đặt cọc ${MaPhieuDatCoc}`);
            await DatGiuong(MaPhieuDatCoc, beds[i].MaGiuong);
            console.log(`Đã đặt giường ${beds[i].MaGiuong} cho phiếu đặt cọc ${MaPhieuDatCoc}, đang cập nhật trạng thái giường...`);
            await CapNhatTrangThaiGiuong(beds[i].MaGiuong, 'Đã có người'); // Cập nhật trạng thái giường sau khi đặt
            console.log(`Đã đặt giường ${beds[i].MaGiuong} cho phiếu đặt cọc ${MaPhieuDatCoc}`);
        }
        res.json({ message: 'Thanh toán đã được ghi nhận!' });
    } catch (err) {
        res.status(500).send('Lỗi server rồi: ' + err.message);
    }
});

router.post('/appointment', async (req, res) => {
    try {
        const { MaPhieuYC, NgayHen, GioHen } = req.body;
        // chuyển đổi NgayHen và GioHen thành định dạng DateTime của SQL Server
        const ngayGioHen = new Date(`${NgayHen}T${GioHen}`);
        console.log('Dữ liệu nhận được để tạo lịch hẹn:', { MaPhieuYC, NgayHen, GioHen, ngayGioHen });
        const maLH = await TaoLichHenNhanPhong(ngayGioHen, MaPhieuYC);
        res.json({ message: 'Lịch hẹn đã được tạo!', MaLichHen: maLH });
    } catch (err) {
        res.status(500).send('Lỗi server rồi: ' + err.message);
    }
});

module.exports = router;