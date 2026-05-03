const { poolPromise, mssql } = require('../config/db');

const getEmployeeByMaNV = async (MaNV) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('MaNV', mssql.VarChar(50), MaNV)
        .query(`
            SELECT nv.MaNV, nv.TenNV,
                CASE 
                    WHEN EXISTS (SELECT 1 FROM NV_KDOANH WHERE MaNV = @MaNV) THEN 'NV_KDOANH'
                    WHEN EXISTS (SELECT 1 FROM NV_QLY WHERE MaNV = @MaNV) THEN 'NV_QLY'
                    WHEN EXISTS (SELECT 1 FROM NV_KTOAN WHERE MaNV = @MaNV) THEN 'NV_KTOAN'
                    ELSE 'UNKNOWN'
                END as Role
            FROM NHANVIEN nv
            WHERE nv.MaNV = @MaNV
        `);
    return result.recordset[0] || null;
};

module.exports = {
    getEmployeeByMaNV,
};
