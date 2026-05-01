const { poolPromise, mssql } = require('../config/db');

const getAllRooms = async () => {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Rooms');
    return result.recordset;
};

module.exports = { getAllRooms };