const { poolPromise, mssql } = require('../config/db');

const LayPhieuYeuCauGanNhat = async (MaKH) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('MaKH', mssql.VarChar(50), MaKH)
        .query(`
            SELECT TOP 1 *
            FROM PHIEUYEUCAU
            WHERE MaKH = @MaKH
            ORDER BY MaPhieuYC DESC
        `);
    return result.recordset[0] || null;
};

module.exports = {
    LayPhieuYeuCauGanNhat,
};
