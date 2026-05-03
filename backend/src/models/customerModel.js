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

module.exports = {
    getAllCustomers,
    getCustomerById,
    searchCustomers,
};
