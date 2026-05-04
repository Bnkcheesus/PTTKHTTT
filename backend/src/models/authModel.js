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

const getEmployeeByUsername = async (username) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('username', mssql.VarChar(50), username)
        .query(`
            SELECT 
                nv.MaNV, 
                nv.TenNV,
                CASE 
                    WHEN EXISTS(SELECT 1 FROM NV_QLY WHERE MaNV = nv.MaNV) THEN 'Manager'
                    WHEN EXISTS(SELECT 1 FROM NV_KDOANH WHERE MaNV = nv.MaNV) THEN 'Sales'
                    WHEN EXISTS(SELECT 1 FROM NV_KTOAN WHERE MaNV = nv.MaNV) THEN 'Accounting'
                    ELSE 'Other'
                END AS employeeType
            FROM NHANVIEN nv
            WHERE nv.MaNV = @username
        `);

    return result.recordset[0] || null;
};

module.exports = {
    getEmployeeByMaNV,
    getEmployeeByUsername
};
