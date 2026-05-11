const { poolPromise, mssql } = require('../config/db');

const LayDanhSachPhong = async () => {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM PHONG');
    return result.recordset;
};

const LayChiTietPhong = async (MaPhong) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('MaPhong', mssql.VarChar(50), MaPhong)
        .execute('LayChiTietPhong'); // Gọi Stored Procedure LayChiTietPhong
    return result.recordset[0] || null;
};

const getInspectionCandidates = async () => {
    const pool = await poolPromise;
    const result = await pool.request().query(`
        SELECT
            PTR.MaPhieuTra,
            PDC.MaPhieuDatCoc,
            ISNULL(HD.MaHopDong, N'Không có') AS MaHopDong,
            KH.HoTen,
            P.MaPhong,
            HD.NgayBatDau,
            HD.NgayKetThuc,
            PTR.NgayTraPhong
        FROM PHIEUTRAPHONG PTR
        JOIN PHIEUDATCOC PDC ON PTR.MaPhieuDatCoc = PDC.MaPhieuDatCoc
        LEFT JOIN HOPDONG HD ON HD.MaPhieuDatCoc = PDC.MaPhieuDatCoc
        JOIN KHACHHANG KH ON PDC.MaKH = KH.MaKH
        LEFT JOIN PHONG P ON PDC.MaPhong = P.MaPhong
        WHERE PTR.MaPhieuTra NOT IN (SELECT MaPhieuTra FROM PHIEUKIEMTRA)
    `);
    return result.recordset;
};

const getHandoverInfoFromReturnVoucher = async (MaPhieuTra) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('MaPhieuTra', mssql.VarChar(50), MaPhieuTra)
        .query(`
            SELECT
                PTR.MaPhieuTra,
                PDC.MaPhieuDatCoc,
                ISNULL(HD.MaHopDong, N'Không có') AS MaHopDong,
                P.MaPhong,
                P.GiaThuePhong,
                KH.HoTen,
                KH.SDT,
                KH.Email,
                HD.NgayBatDau,
                HD.NgayKetThuc,
                PTR.NgayTraPhong
            FROM PHIEUTRAPHONG PTR
            JOIN PHIEUDATCOC PDC ON PTR.MaPhieuDatCoc = PDC.MaPhieuDatCoc
            LEFT JOIN HOPDONG HD ON HD.MaPhieuDatCoc = PDC.MaPhieuDatCoc
            JOIN KHACHHANG KH ON PDC.MaKH = KH.MaKH
            LEFT JOIN PHONG P ON PDC.MaPhong = P.MaPhong
            WHERE PTR.MaPhieuTra = @MaPhieuTra
        `);
    return result.recordset[0] || null;
};

const createInspectionVoucher = async ({ MaPhieuKiemTra = null, MaPhieuTra, SoDienDung = 0, SoNuocDung = 0, TienThueNo = 0, TienPhat = 0, MaNV }) => {
    const pool = await poolPromise;
    const request = pool.request()
        .input('MaPhieuKiemTra', mssql.VarChar(50), MaPhieuKiemTra)
        .input('MaPhieuTra', mssql.VarChar(50), MaPhieuTra)
        .input('SoDienDung', mssql.Float, parseFloat(SoDienDung) || 0)
        .input('SoNuocDung', mssql.Float, parseFloat(SoNuocDung) || 0)
        .input('TienThueNo', mssql.Decimal(18, 2), parseFloat(TienThueNo) || 0)
        .input('TienPhat', mssql.Decimal(18, 2), parseFloat(TienPhat) || 0)
        .input('MaNV', mssql.VarChar(50), MaNV);

    const result = await request.execute('LapPhieuKiemTra');
    return result.recordset[0];
};

const addInspectionDetail = async (MaPhieuKiemTra, MaThietBi, SoLuongHuHong) => {
    const pool = await poolPromise;
    await pool.request()
        .input('MaPhieuKiemTra', mssql.VarChar(50), MaPhieuKiemTra)
        .input('MaThietBi', mssql.VarChar(50), MaThietBi)
        .input('SoLuongHuHong', mssql.Int, parseInt(SoLuongHuHong, 10))
        .execute('ThemChiTietKiemTra');
};

module.exports = { 
    LayDanhSachPhong, 
    LayChiTietPhong,
    getInspectionCandidates,
    getHandoverInfoFromReturnVoucher,
    createInspectionVoucher,
    addInspectionDetail,
};