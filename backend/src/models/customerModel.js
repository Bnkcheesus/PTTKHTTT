const { poolPromise, mssql } = require('../config/db');

const getAllCustomers = async () => {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM KHACHHANG');
    return result.recordset;
};

const getCustomerById = async (MaKH) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('MaKH', mssql.VarChar(50), MaKH)
        .query('SELECT * FROM KHACHHANG WHERE MaKH = @MaKH');
    return result.recordset[0] || null;
};

const searchCustomers = async (searchTerm) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('searchTerm', mssql.NVarChar(100), `%${searchTerm}%`)
        .query(`
            SELECT * FROM KHACHHANG 
            WHERE HoTen LIKE @searchTerm 
               OR SDT LIKE @searchTerm 
               OR Email LIKE @searchTerm
               OR MaKH LIKE @searchTerm
        `);
    return result.recordset;
};

const ThemKH = async (data) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('HoTen', mssql.NVarChar, data.HoTen)
        .input('SDT', mssql.VarChar, data.SDT)
        .input('Email', mssql.VarChar, data.Email)
        .input('GioiTinh', mssql.NVarChar, data.GioiTinh)
        .input('CCCD', mssql.VarChar, data.CCCD)
        .execute('ThemKH');
    return result.recordset[0].MaKHMoi;
};

const ThemNhom = async (maKHDaiDien) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('MaKHDaiDien', mssql.VarChar(50), maKHDaiDien)
        .execute('ThemNhom'); 
    return result.recordset[0].MaNhomMoi; 
};

const ThemCTNhom = async (maNhom, maKH) => {
    const pool = await poolPromise;
    await pool.request()
        .input('MaNhom', mssql.VarChar(50), maNhom)
        .input('MaKH', mssql.VarChar(50), maKH)
        .execute('ThemCTNhom');
};

const ThemPYC = async (data) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('SoNguoiDuKien', mssql.Int, data.SoNguoiDuKien)
        .input('KhoangGia', mssql.Decimal, data.KhoangGia)
        .input('ThoiGianDuKien', mssql.NVarChar, data.ThoiGianDuKien)
        .input('GhiChu', mssql.NVarChar, data.GhiChu)
        .input('HinhThucThue', mssql.NVarChar, data.HinhThucThue)
        .input('MaKH', mssql.VarChar, data.MaKH)
        .input('MaKV', mssql.VarChar, data.MaKV)
        .input('MaLoai', mssql.VarChar, data.MaLoai)
        .input('MaPhong', mssql.VarChar, data.MaPhong)
        .execute('ThemPYC');
    return result.recordset[0].MaPhieuYCMoi;
};

const LayThongTinKH = async (CCCD) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('CCCD', mssql.VarChar(20), CCCD)
        .execute('LayChiTietKH_CCCD');
    return result.recordset[0] || null; // Trả về thông tin khách hoặc null nếu là khách mới
};

module.exports = {
    getAllCustomers,
    getCustomerById,
    searchCustomers,
    ThemKH,
    ThemNhom,
    ThemCTNhom,
    ThemPYC,
    LayThongTinKH
};