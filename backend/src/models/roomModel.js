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

const LayThongTinPhong = async (MaPhong) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('MaPhong', mssql.VarChar(50), MaPhong)
        .query(`
            SELECT p.*, kv.TenKhuVuc, kv.DiaChi, lp.TenLoai
            FROM PHONG p, KHUVUC kv, LOAIPHONG lp
            WHERE p.MaKV = kv.MaKV AND p.MaLoai = lp.MaLoai AND p.MaPhong = @MaPhong
        `);
    return result.recordset[0] || null;
};


module.exports = { 
    LayDanhSachPhong, 
    LayChiTietPhong,
    LayThongTinPhong
};