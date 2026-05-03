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

module.exports = { 
    LayDanhSachPhong, 
    LayChiTietPhong
};