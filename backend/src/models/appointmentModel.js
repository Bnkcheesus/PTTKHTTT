const { poolPromise, mssql } = require('../config/db');

const LayDSKhachChuaHen = async () => {
    const pool = await poolPromise;
    const result = await pool.request().execute('LayDSKhachChuaHen');
    return result.recordset;
};

const KiemTraTrungLich = async (ThoiGian, MaNV) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('ThoiGian', mssql.DateTime, ThoiGian)
        .input('MaNV', mssql.VarChar, MaNV)
        .execute('KiemTraTrungLich');
    return result.recordset[0].IsTrungLich;
};

const ThemLichHen = async (data) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('ThoiGian', mssql.DateTime, data.ThoiGian)
        .input('LyDo', mssql.NVarChar, data.LyDo)
        .input('MaPhieuYC', mssql.VarChar, data.MaPhieuYC)
        .input('MaNV', mssql.VarChar, data.MaNV)
        .execute('ThemLichHen');
    return result.recordset[0].MaLHMoi;
};

const LayChiTietPYCTuMaKH = async (MaKH) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('MaKH', mssql.VarChar(50), MaKH)
        .execute('LayChiTietPYCTuMaKH');
    return result.recordset[0] || null; // Lấy chi tiết phiếu yêu cầu của khách đó
};

module.exports = { 
    LayDSKhachChuaHen,
    KiemTraTrungLich,
    ThemLichHen,
    LayChiTietPYCTuMaKH
};