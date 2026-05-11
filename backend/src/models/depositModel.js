const { poolPromise, mssql } = require('../config/db');

/**
 * --- XÁC NHẬN THUÊ ---
 */

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
const createDeposit = async ({ tienCoc, maKH, maNV, maPhong, maPhieuYC }) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('TrangThai', mssql.NVarChar(50), 'Chưa thanh toán')
        .input('TienCoc', mssql.Decimal(18, 2), tienCoc)
        .input('MaKH', mssql.VarChar(50), maKH)
        .input('MaNV', mssql.VarChar(50), maNV)
        .input('MaPhong', mssql.VarChar(50), maPhong)
        .input('MaPhieuYC', mssql.VarChar(50), maPhieuYC)
        .execute('ThemPDC');

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
const expireOldPendingDeposits = async () => {
    const pool = await poolPromise;
    await pool.request().query(`
        UPDATE PHIEUDATCOC
        SET TrangThai = N'Đã hủy'
        WHERE TrangThai = N'Chưa thanh toán'
            AND DATEDIFF(day, NgayLap, GETDATE()) >= 1
    `);
};

const getPendingPayments = async () => {
    const pool = await poolPromise;
    await expireOldPendingDeposits();

    const result = await pool.request().query(`
        SELECT
            pdc.MaPhieuDatCoc,
            pdc.TienCoc,
            pdc.TrangThai,
            pdc.NgayLap,
            pdc.HinhThucThanhToan,
            kh.MaKH,
            kh.HoTen,
            kh.CCCD,
            pdc.MaPhong,
            pdc.MaPhieuYC,
            pdc.MaNV
        FROM PHIEUDATCOC pdc
        JOIN KHACHHANG kh ON pdc.MaKH = kh.MaKH
        WHERE pdc.TrangThai = N'Chưa thanh toán'
            AND NOT EXISTS (
                SELECT 1 FROM HOPDONG hd WHERE hd.MaPhieuDatCoc = pdc.MaPhieuDatCoc
            )
        ORDER BY pdc.NgayLap DESC
    `);
    return result.recordset;
};

const cancelDeposit = async (maPDC) => {
    const pool = await poolPromise;
    await pool.request()
        .input('MaPDC', mssql.VarChar(50), maPDC)
        .query(`
            UPDATE PHIEUDATCOC
            SET TrangThai = N'Đã hủy'
            WHERE MaPhieuDatCoc = @MaPDC
        `);
};

const updatePaymentStatus = async (maPDC, hinhThucThanhToan) => {
    const pool = await poolPromise;
    await pool.request()
        .input('MaPDC', mssql.VarChar(50), maPDC)
        .input('HinhThucThanhToan', mssql.NVarChar(20), hinhThucThanhToan)
        .execute('CapNhatPDC_DaThanhToan');
};

module.exports = {
    getPendingRequestByCCCD,
    createDeposit,
    getDepositInfoByCCCD,
    updatePaymentStatus,
    getPendingPayments,
    cancelDeposit
};