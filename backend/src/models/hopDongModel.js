const { poolPromise, mssql } = require('../config/db');

const getPaidDepositsNoContract = async () => {
    const pool = await poolPromise;
    const result = await pool.request().execute('sp_GetAllDepositPaid');
    return result.recordset;
};

const getApprovedDepositsNoContract = async () => {
    const pool = await poolPromise;
    const result = await pool.request().execute('LayDSDatCocDuocDuyet');
    return result.recordset;
};

const approveDeposit = async (maPhieu) => {
    const pool = await poolPromise;
    await pool.request()
        .input('maPhieu', mssql.VarChar(50), maPhieu)
        .execute('sp_DuyetDatCoc');
};

const rejectDeposit = async (maPhieu) => {
    const pool = await poolPromise;
    await pool.request()
        .input('maPhieu', mssql.VarChar(50), maPhieu)
        .execute('sp_TuChoiDatCoc');
};

const getContractList = async () => {
    const pool = await poolPromise;
    const result = await pool.request().execute('LayDSHopDong');
    return result.recordset;
};

const createContract = async ({ MaPhieu, NgayBatDau, NgayKetThuc, NoiDungHD, MaNV = null }) => {
    const pool = await poolPromise;
    await pool.request()
        .input('MaPhieu', mssql.VarChar(50), MaPhieu)
        .input('NgayBatDau', mssql.Date, NgayBatDau)
        .input('NgayKetThuc', mssql.Date, NgayKetThuc)
        .input('NoiDungHD', mssql.NVarChar(500), NoiDungHD)
        .input('MaNV', mssql.VarChar(50), MaNV)
        .execute('LapHopDong');
};

const createBienBan = async (MaHD, MaNV = null) => {
    const pool = await poolPromise;
    await pool.request()
        .input('MaHD', mssql.VarChar(50), MaHD)
        .input('MaNV', mssql.VarChar(50), MaNV)
        .execute('LapBienBan');
};

const getEquipmentList = async () => {
    const pool = await poolPromise;
    const result = await pool.request().execute('LayDSThietBi');
    return result.recordset;
};

const getBienBanDetails = async (MaHD) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('MaHD', mssql.VarChar(50), MaHD)
        .execute('DisplayChiTietBienBan');
    return result.recordset;
};

const addBienBanDetail = async (MaHD, MaTB, SoLuong) => {
    const pool = await poolPromise;
    await pool.request()
        .input('MaHD', mssql.VarChar(50), MaHD)
        .input('MaTB', mssql.VarChar(50), MaTB)
        .input('SoLuong', mssql.Int, SoLuong)
        .execute('ThemChiTietBienBan');
};

const removeBienBanDetail = async (MaHD, MaTB) => {
    const pool = await poolPromise;
    await pool.request()
        .input('MaHD', mssql.VarChar(50), MaHD)
        .input('MaTB', mssql.VarChar(50), MaTB)
        .execute('XoaChiTietBienBan');
};

module.exports = {
    getPaidDepositsNoContract,
    getApprovedDepositsNoContract,
    getContractList,
    approveDeposit,
    rejectDeposit,
    createContract,
    createBienBan,
    getEquipmentList,
    getBienBanDetails,
    addBienBanDetail,
    removeBienBanDetail,
};