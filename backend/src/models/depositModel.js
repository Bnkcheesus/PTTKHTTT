const { poolPromise, mssql } = require('../config/db');

const LayPhieuDatCocTheoMaPhieuYC = async (MaPhieuYC) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('MaPhieuYC', mssql.VarChar(50), MaPhieuYC)
        .query(`
            SELECT *
            FROM PHIEUDATCOC
            WHERE MaPhieuYC = @MaPhieuYC
        `)
    return result.recordset[0] || null;
};

// Tìm kiếm thông tin yêu cầu thuê dựa trên CCCD để hiển thị lên Form Xác nhận
const getPendingRequestByCCCD = async (cccd) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('CCCD', mssql.VarChar(20), cccd)
        .query(`
            SELECT TOP 1 
                kh.MaKH, kh.HoTen, kh.SDT, kh.Email, kh.GioiTinh, kh.CCCD,
                pyc.MaPhieuYC, pyc.HinhThucThue, pyc.SoNguoiDuKien, pyc.ThoiGianDuKien,
                p.MaPhong, p.SoNguoiThueToiDa, p.GiaThuePhong, p.TrangThai as TinhTrangPhong,
                kv.TenKhuVuc, kv.DiaChi, lp.TenLoai
            FROM KHACHHANG kh
            JOIN PHIEUYEUCAU pyc ON kh.MaKH = pyc.MaKH
            LEFT JOIN PHONG p ON pyc.MaPhong = p.MaPhong
            LEFT JOIN KHUVUC kv ON p.MaKV = kv.MaKV
            LEFT JOIN LOAIPHONG lp ON p.MaLoai = lp.MaLoai
            WHERE kh.CCCD = @CCCD
            ORDER BY pyc.MaPhieuYC DESC
        `);
    return result.recordset[0];
};

// Tạo Phiếu Đặt Cọc mới (gọi SP ThemPDC từ File 5)
// file: depositModel.js
const createDeposit = async (tienCoc, maKH, maNV, maPhong, maPhieuYC) => {
    console.log('Dữ liệu nhận được để tạo Phiếu Đặt Cọc:', { tienCoc, maKH, maNV, maPhong, maPhieuYC }); 
    const pool = await poolPromise;
    
    // Tạo request và truyền các biến bắt buộc
    const request = pool.request()
        .input('TienCoc', mssql.Decimal(18, 2), tienCoc)
        .input('MaKH', mssql.VarChar(50), maKH)
        .input('MaPhong', mssql.VarChar(50), maPhong)
        .input('MaPhieuYC', mssql.VarChar(50), maPhieuYC);

    // Chỉ truyền MaNV nếu nó tồn tại (khác null và undefined)
    if (maNV !== null && maNV !== undefined) {
        request.input('MaNV', mssql.VarChar(50), maNV);
    }

    // Thực thi Stored Procedure
    const result = await request.execute('ThemPDC');

    return result.recordset[0].MaPhieuDatCocMoi;
};

/**
 * --- THANH TOÁN CỌC ---
 */

// Tìm kiếm Phiếu Đặt Cọc chưa thanh toán dựa trên CCCD
const getDepositInfoByCCCD = async (cccd) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('CCCD', mssql.VarChar(20), cccd)
        .query(`
            SELECT TOP 1 
                pdc.MaPhieuDatCoc, pdc.TienCoc, pdc.TrangThai, 
                kh.MaKH, kh.HoTen, 
                p.MaPhong,
                pyc.HinhThucThue,
                (SELECT COUNT(*) FROM CHITIETDATCOC WHERE MaPhieuDatCoc = pdc.MaPhieuDatCoc) as SoGiuongThue
            FROM KHACHHANG kh
            JOIN PHIEUDATCOC pdc ON kh.MaKH = pdc.MaKH
            LEFT JOIN PHONG p ON pdc.MaPhong = p.MaPhong
            LEFT JOIN PHIEUYEUCAU pyc ON pdc.MaPhieuYC = pyc.MaPhieuYC
            WHERE kh.CCCD = @CCCD
            ORDER BY pdc.NgayLap DESC
        `);
    return result.recordset[0];
};

// Cập nhật trạng thái đã thanh toán (gọi SP CapNhatPDC_DaThanhToan từ File 6)
const updatePaymentStatus = async (maPDC, hinhThucThanhToan) => {
    const pool = await poolPromise;
    await pool.request()
        .input('MaPDC', mssql.VarChar(50), maPDC)
        .input('HinhThucThanhToan', mssql.NVarChar(20), hinhThucThanhToan)
        .execute('CapNhatPDC_DaThanhToan');
};

const GhiNhanThanhToan = async (maPDC, hinhThucThanhToan) => {
    const pool = await poolPromise;
    await pool.request()
        .input('MaPDC', mssql.VarChar(50), maPDC)
        .input('HinhThucThanhToan', mssql.NVarChar(20), hinhThucThanhToan)
        .execute('CapNhatPDC_DaThanhToan');
};

const DatGiuong = async (maPDC, maGiuong) => {
    const pool = await poolPromise;
    await pool.request()
        .input('MaPhieuDatCoc', mssql.VarChar(50), maPDC)
        .input('MaGiuong', mssql.VarChar(50), maGiuong)
        .execute('ThemChiTietDatCoc');
};

const TaoLichHenNhanPhong = async (ngayGioHen, maPhieuYC) => {
    const pool = await poolPromise;

    //const thoiGianSach = ngayGioHen.replace('T', ' ').replace(/\..*$/, '');
    console.log('Đang tạo lịch hẹn với thời gian:', ngayGioHen, 'và mã phiếu yêu cầu:', maPhieuYC); // Debug log

    const result = await pool.request()
        .input('ThoiGian', mssql.DateTime, ngayGioHen)
        .input('LyDo', mssql.NVarChar(255), 'Hẹn nhận phòng')
        .input('MaPhieuYC', mssql.VarChar(50), maPhieuYC)
        .input('MaNV', mssql.VarChar(50), null) // Tạm thời gán MaNV cố định, có thể thay đổi sau
        .execute('ThemLichHen');
    return result.recordset[0].MaLH;
};

const updateCustomerInfo = async (maKH, data) => {
    const pool = await poolPromise;
    await pool.request()
        .input('MaKH', mssql.VarChar(50), maKH)
        .input('HoTen', mssql.NVarChar(100), data.HoTen)
        .input('SDT', mssql.VarChar(20), data.SDT)
        .input('Email', mssql.VarChar(100), data.Email)
        .input('GioiTinh', mssql.NVarChar(10), data.GioiTinh)
        .execute('CapNhatThongTinKH');
};

module.exports = {
    LayPhieuDatCocTheoMaPhieuYC,
    getPendingRequestByCCCD,
    createDeposit,
    TaoLichHenNhanPhong,
    GhiNhanThanhToan,
    DatGiuong,
    getDepositInfoByCCCD,
    updateCustomerInfo,
    updatePaymentStatus
};